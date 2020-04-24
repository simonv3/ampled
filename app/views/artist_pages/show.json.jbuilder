json.id @artist_page.id
json.name @artist_page.name
json.slug @artist_page.slug
json.location @artist_page.location
json.bio @artist_page.bio
json.accent_color @artist_page.accent_color
json.video_url @artist_page.video_url
json.video_screenshot_url @artist_page.video_screenshot_url
json.twitter_handle @artist_page.twitter_handle
json.instagram_handle @artist_page.instagram_handle
json.images @artist_page.images, partial: "images/image", as: :image
json.isStripeSetup @artist_page.is_stripe_ready
json.approved @artist_page.approved

json.most_recent_supporter do
  if @artist_page.most_recent_supporter.present?
    json.partial! "users/user", user: @artist_page.most_recent_supporter
  else
    json.null!
  end
end

json.owners @artist_page.page_ownerships do |ownership|
  json.partial! "users/user", user: ownership.user
  if !current_user.nil? && @artist_page.owners.exists?(current_user.id)
    json.email ownership.user.email
    json.lastName ownership.user.last_name
  end
  json.role ownership.role
  json.instrument ownership.instrument
end

json.supporters @artist_page.active_subscribers, partial: "users/user", as: :user

@expand_artist = false

json.posts @artist_page.posts, partial: "posts/post", as: :post
