json.userInfo do
  json.id current_user&.id
  json.name current_user&.name
  json.image current_user&.profile_image_url
  json.created_at current_user&.created_at
end
json.artistPages @owned&.concat(@supported) do |page|
  json.artistId page.id
  json.role page.role
end
json.subscriptions @subscriptions do |subscription|
  json.id subscription.artist_page.id
  json.name subscription.artist_page.name
  json.image subscription.artist_page.banner_image_url
  json.last_post_date subscription.artist_page.last_post_date
  json.support_date subscription.created_at
  json.amount subscription.plan.amount
end
json.ownedPages @owned_pages do |page|
  json.artistId page.id
  json.name page.name
  json.image page.image
  json.supportersCount page.subscriber_count
  json.monthlyTotal page.monthly_total
  json.lastPost page.last_post_date
  json.lastPayout page.last_payout
end
