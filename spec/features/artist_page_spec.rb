require "rails_helper"

RSpec.describe ArtistPagesController, type: :request do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:supporter) { create(:user, confirmed_at: Time.current) }

  let(:artist_page) { create(:artist_page, slug: "test", approved: true) }
  let(:artist_page_unapproved) { create(:artist_page, slug: "unapproved", approved: false) }

  before(:each) do
    sign_in user
  end

  context "when loading all artist_pages" do
    let(:url) { "/artist_pages.json" }

    it "returns 200" do
      get url

      expect(response.status).to eq 200
    end

    it "responds with a JSON array" do
      get url

      expect(JSON.parse(response.body)).to be_a(Array)
    end
  end

  context "when loading approved artist_page data" do
    let(:url) { "/artist_pages/#{artist_page.id}.json" }
    let(:slugurl) { "/slug/#{artist_page.slug}.json" }

    it "returns 200" do
      get url

      expect(response.status).to eq 200
    end

    xit "responds with JSON including the artist_page id" do
      get url

      expect(JSON.parse(response.body)["id"]).to eq artist_page.id
    end

    xit "responds with JSON including the artist_page slug" do
      get slugurl

      expect(JSON.parse(response.body)["slug"]).to eq artist_page.slug
    end

    xit "includes active supporter data" do
      create(:subscription, user: supporter, artist_page: artist_page)
      get url

      expect(JSON.parse(response.body)["supporters"].first["id"]).to eq supporter.id
    end

    xit "does not include subscribers that are not active" do
      create(:subscription, user: supporter, artist_page: artist_page, status: :cancelled)
      get url

      expect(JSON.parse(response.body)["supporters"].count).to eq 0
    end
  end

  context "when loading unapproved artist_page data as an anonymous user" do
    let(:url) { "/artist_pages/#{artist_page_unapproved.id}.json" }
    let(:slugurl) { "/slug/#{artist_page_unapproved.slug}.json" }

    it "returns 400" do
      get url

      expect(response.status).to eq 400
    end
  end
end
