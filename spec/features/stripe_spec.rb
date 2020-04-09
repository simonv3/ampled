require "rails_helper"

RSpec.describe StripeController, type: :request do
  context "when webhook is called" do
    let(:webhook_url) { "/stripe_hook" }
    let(:webhook_params) do
      {
        object: "event",
        data: {
          object: {
            id: "abc"
          }
        }
      }
    end

    before(:each) do
      allow(Stripe::Webhook).to receive(:construct_event) { nil }
    end

    it "returns 200" do
      post webhook_url, params: webhook_params

      expect(response.status).to eq 200
    end

    context("given event type is invoice.payment_failed") do
      let(:event_type) { "invoice.payment_failed" }
      let(:user) { create(:user, card_is_valid: true, subscriptions: [create(:subscription, stripe_id: "sub_1234")]) }

      before(:each) do
        webhook_params[:type] = event_type
        webhook_params[:data][:object][:subscription] = user.subscriptions.first.stripe_id
      end

      it "should find subscription by stripe_id" do
        allow(Subscription).to receive(:find_by).and_call_original

        post webhook_url, params: webhook_params

        subscription = user.subscriptions.first
        expect(Subscription).to have_received(:find_by).with(stripe_id: subscription.stripe_id)
      end

      it "should find user by id" do
        allow(User).to receive(:find).and_call_original

        post webhook_url, params: webhook_params

        expect(User).to have_received(:find).with(user.id)
      end

      it "should update user card_is_valid to false" do
        post webhook_url, params: webhook_params

        expect(User.find(user.id).card_is_valid).to eq(false)
      end

      it "should call CardDeclinedEmailJob" do
        allow(CardDeclineEmailJob).to receive(:perform_async)

        prev_redis_url = ENV["REDIS_URL"]
        begin
          ENV["REDIS_URL"] = "temp"
          post webhook_url, params: webhook_params
        ensure
          ENV["REDIS_URL"] = prev_redis_url
        end

        subscription = user.subscriptions.first
        expect(CardDeclineEmailJob).to have_received(:perform_async).with(subscription.id)
      end
    end

    context("given event type is payout.paid") do
      let(:event_type) { "payout.paid" }
      let(:amount) { 2402 }
      let(:currency) { "usd" }
      let(:arrival_date) { 1_586_136_170 }
      let(:account) { "acc_12345" }

      before(:each) do
        webhook_params[:type] = event_type
        webhook_params[:account] = account
        webhook_params[:data][:object][:amount] = amount
        webhook_params[:data][:object][:currency] = currency
        webhook_params[:data][:object][:arrival_date] = arrival_date
      end

      it "should have called ArtistPaidEmailJob" do
        allow(ArtistPaidEmailJob).to receive(:perform_async)

        prev_redis_url = ENV["REDIS_URL"]
        begin
          ENV["REDIS_URL"] = "temp"
          post webhook_url, params: webhook_params
        ensure
          ENV["REDIS_URL"] = prev_redis_url
        end

        expect(ArtistPaidEmailJob).to have_received(:perform_async)
          .with(account, amount, currency, DateTime.strptime(arrival_date.to_s, "%s"))
      end

      it "should rescue and capture ArtistNotFound error" do
        error = ArtistPaidEmailJob::ArtistNotFound.new "BOOM! Test error message."
        allow(ArtistPaidEmailJob).to receive(:perform_async).and_raise(error)
        allow(Raven).to receive(:capture_exception)

        prev_redis_url = ENV["REDIS_URL"]
        begin
          ENV["REDIS_URL"] = "temp"
          post webhook_url, params: webhook_params
        ensure
          ENV["REDIS_URL"] = prev_redis_url
        end

        json = JSON.parse(response.body)
        expect(json["message"]).to eq(error.message)
        expect(Raven).to have_received(:capture_exception).with(error)
      end

      it "should rescue and capture ConnectAccountNotFound error" do
        error = ArtistPaidEmailJob::ConnectAccountNotFound.new "BOOM! Test error message."
        allow(ArtistPaidEmailJob).to receive(:perform_async).and_raise(error)
        allow(Raven).to receive(:capture_exception)

        prev_redis_url = ENV["REDIS_URL"]
        begin
          ENV["REDIS_URL"] = "temp"
          post webhook_url, params: webhook_params
        ensure
          ENV["REDIS_URL"] = prev_redis_url
        end

        json = JSON.parse(response.body)
        expect(json["message"]).to eq(error.message)
        expect(Raven).to have_received(:capture_exception).with(error)
      end
    end
  end
end
