require "rails_helper"

describe NewSupporterEmailJob, type: :job do
  it "sends emails to the owners of the artist page" do
    allow(SendBatchEmail).to receive(:call)
    owner = create(:user)
    artist = create(:artist_page)
    artist.owners << owner
    plan = create(:plan, artist_page: artist, nominal_amount: 500)
    supporter = create(:user)
    subscription = create(:subscription, user: supporter, artist_page: artist, plan: plan)

    described_class.new.perform(subscription.id)

    expect(SendBatchEmail).to have_received(:call).with(
      [
        {
          from: ENV["POSTMARK_FROM_EMAIL"],
          to: owner.email,
          template_alias: "new-supporter",
          template_model: {
            supporter_name: supporter.name,
            artist_name: artist.name,
            support_amount: format("%.2f", subscription.plan.nominal_amount / 100),
            total_artist_support_amount: format("%.2f", artist.monthly_total / 100)
          }
        }
      ]
    )
  end
end
