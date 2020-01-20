class FanWelcomeMailer < PostmarkMailer
  # method name must match alias on postmark
  def fan_welcome(user)
    self.template_model = {
      homepage_url: ENV["REACT_APP_API_URL"],
      login_url: ENV["REACT_APP_API_URL"],
      fan_email_address: user.email,
      support_email: ENV["POSTMARK_FROM_EMAIL"],
      ampled_membership_url: ENV["REACT_APP_API_URL"],
      first_name: user.name
    }

    mail to: user.email
  end
end
