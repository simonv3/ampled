class ArtistPagesController < ApplicationController
  before_action :set_artist_page, :set_page_ownership, only: %i[show edit update destroy]
  before_action :check_approved, only: :show
  before_action :check_user, only: %i[create update]
  before_action :check_cooldown, only: :create
  before_action :check_has_image, only: :create
  before_action :check_create_okay, only: :create
  before_action :check_update_okay, only: :update

  # How many randomly-picked artists to return for the #index endpoint.
  INDEX_ARTIST_COUNT = 8

  def index
    @artist_pages = ArtistPage.includes(:images).approved.artist_owner
      .exclude_community_page.with_images.order(Arel.sql("RANDOM()")).take(INDEX_ARTIST_COUNT)
    @artist_page_count = ArtistPage.count

    respond_to do |format|
      format.html do
        redirect_to "/"
      end
      format.json
    end
  end

  def browse
    # The "seed" param is generated by the frontend client, and is a float
    # between 0 and 1. This seed is used to randomly sort the table while
    # maintaining a stable sort order across pages served to a single client.
    #
    # Sorting the entire table in memory like this is NOT IDEAL and should be
    # reevaluated as we scale.
    #
    # We then paginate into groups of 8 using Kaminari.

    if params.has_key?(:seed)
      seed = params[:seed].to_f
      ArtistPage.connection.execute ArtistPage.sanitize_sql_like("SELECT setseed(#{seed})")
      base_query = ArtistPage.approved.order(Arel.sql("random()"))
      @artist_pages = if params.has_key?(:artist_owners)
                        base_query.artist_owner.exclude_community_page
                      else
                        base_query
                      end.page(params[:page]).per(8)
    end

    render template: "artist_pages/index"
  end

  def typeahead
    if params[:query].empty?
      @artist_pages = []
    else
      query = ArtistPage.sanitize_sql_like(params[:query])
      @artist_pages = ArtistPage.approved.where("lower(name) LIKE ?", "%#{query}%").take(8)
    end
    @artist_page_count = @artist_pages.count

    render template: "artist_pages/index"
  end

  def all_artists
    base_query = ArtistPage
      .includes(:images)
      .approved
      .exclude_community_page
      .with_images
      .order(Arel.sql("LOWER(name)"))
    @artist_pages = base_query
    @artist_page_count = base_query.count
    @artist_pages_under_construction_count = ArtistPage.unapproved.exclude_community_page.count

    render template: "artist_pages/index"
  end

  def show
    respond_to do |format|
      format.html do
        redirect_to "/artist/#{@artist_page.slug}"
      end
      format.json
    end
  end

  def show_pending
    render template: "artist_pages/show_pending"
  end

  def new
    @artist_page = ArtistPage.new
  end

  def create
    # if we used activerecord validations, we could just check ArtistPage.new(...).valid?
    # and if not valid, return @artist_page.errors to give more info about whats wrong
    unless (@artist_page = ArtistPage.create(default_artist_page_params.merge(artist_page_params)))
      return render json: { status: "error", message: "Something went wrong." }
    end

    set_members

    ArtistPageCreateEmailJob.perform_async(@artist_page.id, current_user.id)

    # Subscribe to Mailchimp
    if @artist_page.subscribe_to_newsletter
      ::Mailchimp::MailchimpSubscriber.perform_async(@artist_page.id, current_user.id)
    end

    render json: { status: "ok", message: "Your page has been created!" }
  rescue ActiveRecord::RecordNotUnique
    render json: { status: "error", message: "Someone's already using that custom link." }
  rescue StandardError => e
    Raven.capture_exception(e)
    render json: { status: "error", message: e.message }
  end

  # If the update includes new sets of images, we will delete all the old images after the update is successful.
  def update
    old_image_ids = @artist_page.images.map(&:id)
    if @artist_page.update(artist_page_params)
      if artist_page_params[:application_fee_percent].present?
        UpdateApplicationFeePercentJob.perform_async(
          @artist_page.id,
          artist_page_params[:application_fee_percent]
        )
      end
      Image.where(id: old_image_ids).delete_all unless has_no_images
      set_members unless has_no_members
      render json: { status: "ok", message: "Your page has been updated!" }
    else
      render json: { status: "error", message: "Something went wrong." }
    end
  end

  # rubocop:disable Metrics/CyclomaticComplexity
  def destroy
    unless @role == "admin" || current_user&.admin?
      return render json: { status: "error", message: "You don't have that permission." }
    end

    # This param will be set when the Delete your page button is click by the Artist admin
    # but not when a site admin is deleting a page. When an Artist admin initiates the deletion,
    # we want to let them do that and first cancel any subscriptions.
    cancel_subs = params[:cancel_subscriptions] && params[:cancel_subscriptions] == "true"
    @artist_page.subscriptions.each(&:cancel!) if cancel_subs

    render json: { status: "ok", message: "Your page has been deleted!" } if @artist_page.destroy
  end
  # rubocop:enable Metrics/CyclomaticComplexity

  def request_approval
    set_artist_page

    unless current_user&.owned_pages&.include?(@artist_page)
      return render json: { status: "error", message: "You don't have that permission." }
    end

    ApprovalRequestMailer.approval_requested(@artist_page, current_user).deliver_later
    ApprovalRequestMailer.artist_page_approval_requested_for_artists(@artist_page, current_user).deliver_later
    render json: { status: "ok", message: "We've let the team know you're ready!" }
  end

  def subscribers_csv
    unless current_user&.admin? || current_user&.owned_pages&.include?(@artist_page)
      return render json: { status: 403, error: "Forbidden to non-admins." }, status: :forbidden
    end

    set_artist_page

    response.headers["Content-Disposition"] = "attachment; filename=#{@artist_page.slug}-subscribers.csv"
    render(plain: generate_subscribers_csv_text, content_type: "text/csv")
  end

  private

  # @returns [String]
  def generate_subscribers_csv_text
    CSV.generate do |csv|
      csv << ["Name", "Last Name", "Email"]
      @artist_page.active_subscribers.each do |subscriber|
        csv << [subscriber.name, subscriber.last_name, subscriber.email]
      end
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_artist_page
    @artist_page = if params[:slug]
                     ArtistPage.includes(page_ownerships: [user: %i[image page_ownerships owned_pages]], \
                                         posts: [:audio_uploads, :images, { user: [:image], comments: [:user] }])
                       .find_by(slug: params[:slug])
                   else
                     ArtistPage.find(params[:id])
                   end
    return render json: {}, status: :not_found if @artist_page.nil?
  end

  def set_page_ownership
    @role = PageOwnership.where(user_id: current_user.try(:id), artist_page_id: @artist_page.id).take.try(:role)
  end

  def check_user
    return render json: { status: "error", message: "Confirm your email address first." } if current_user.nil?

    # Pull user from DB in case they've confirmed recently.
    # BA - Was this actually a problem? Could we current_user.reload at the top of the method instead?
    # SA - yeah, current_user.reload wasn't working for some reason :(
    user = User.find_by(id: current_user&.id)

    # Only logged-in users who have confirmed their emails may create artist pages.
    if user&.confirmed_at.nil?
      return render json: { status: "error", message: "Please confirm your email address first." }
    end

    # Otherwise, we're good to go
    true
  end

  def check_cooldown
    # A single user can only create one artist page per 24 hours.
    recent_page_creation = current_user&.last_created_page_date.present? &&
                           current_user.last_created_page_date > 1.day.ago

    return unless recent_page_creation && !Rails.env.test?

    render json: { status: "error", message: "You can't create more than one page per day." }
  end

  def missing_params_error
    render json: { status: "error", message: "Missing required parameters." }
  end

  def missing_members_error
    render json: { status: "error", message: "You need at least one member." }
  end

  def has_no_members
    params[:members].nil? || params[:members][0].nil?
  end

  def has_no_images
    artist_page_params[:images_attributes].blank?
  end

  def check_has_image
    render json: { status: "error", message: "You need at least a main image." } if has_no_images
  end

  def missing_create_params
    artist_page_params[:name].nil? || artist_page_params[:slug].nil? || artist_page_params[:bio].nil? || \
      artist_page_params[:location].nil? || artist_page_params[:accent_color].nil?
  end

  def check_create_okay
    # required params
    # could we use active record validations here instead?
    return unless missing_create_params || has_no_images || has_no_members

    if has_no_members
      missing_members_error
    else
      missing_params_error
    end
  end

  def check_update_okay
    unless @role == "admin" || current_user&.admin?
      return render json: { status: "error", message: "You don't have that permission." }
    end

    # could we just have an update_params method similar to artist_page_params ?
    return if artist_page_params[:slug].nil? && artist_page_params[:name].nil?

    render json: {
      status: "error",
      message: "You can't change your URL or name."
    }
  end

  # rubocop:disable Metrics/CyclomaticComplexity
  def check_approved
    return if @artist_page&.approved? || current_user&.admin?

    return show_pending unless current_user&.owned_pages&.include?(@artist_page)
  end
  # rubocop:enable Metrics/CyclomaticComplexity

  # Only allow a trusted parameter allowlist through.
  def artist_page_params
    Image.rename_params(params, :artist_page)
    params.require(:artist_page).permit(:name, :bio, :twitter_handle, :instagram_handle, :bandcamp_handle,
                                        :youtube_handle, :external, :banner_image_url, :slug, :location,
                                        :accent_color, :video_url, :verb_plural, :members, :hide_members,
                                        :application_fee_percent, images_attributes: Image::PERMITTED_PARAMS)
  end

  # Helper functions for creating / updating an artist page.
  def set_members
    # Store existing owners for later checking if they were already in the band.
    existing_owners = @artist_page.owners.map(&:id)
    @artist_page.owners.clear

    params[:members].map do |member|
      member_user = User.find_by(email: member[:email])

      new_member = false
      if member_user.nil?
        new_member = true
        member_user = create_member(member)
      end

      @artist_page.owners << member_user
      PageOwnership.find_by(user_id: member_user[:id],
                            artist_page_id: @artist_page[:id]).update(instrument: member[:role],
                                                                      role: member[:isAdmin] ? "admin" : "member")

      # Skip emails if the user was already part of the band.
      next if existing_owners.include?(member_user.id)

      send_member_add_email(@artist_page.id, member_user.id, current_user.id, new_member)
    end
    @artist_page.save
  end

  def send_member_add_email(artist_page_id, member_user_id, current_user_id, new_member)
    if new_member
      ArtistPageMemberCreatedJob.perform_async(artist_page_id, member_user_id, current_user_id)
    elsif member_user_id != current_user_id
      ArtistPageMemberAddedJob.perform_async(artist_page_id, member_user_id, current_user_id)
    end
  end

  def create_member(member)
    member_user = User.new(email: member[:email],
                           name: member[:firstName],
                           last_name: member[:lastName],
                           redirect_uri: "/reset-password",
                           password: (0...8).map { rand(65..91).chr }.join)
    member_user.skip_confirmation_notification!
    member_user.save!
    member_user
  end

  def default_artist_page_params
    { application_fee_percent: ArtistPage::DEFAULT_APPLICATION_FEE_PERCENT }
  end
end
