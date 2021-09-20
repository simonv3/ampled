class SetApplicationFeePercentToTen < ActiveRecord::Migration[5.2]
  def up
    ArtistPage.pluck(:id).each do |artist_page_id|
      UpdateApplicationFeePercentJob.perform_async(artist_page_id, 10)
    end
  end
end
