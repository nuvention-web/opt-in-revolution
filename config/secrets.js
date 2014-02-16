module.exports = {

  sendgrid: {
    user: 'Your SendGrid Username',
    password: 'Your SendGrid Password'
  },

  facebook: {
    clientID: 'Your App ID',
    clientSecret: 'Your App Secret',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  google: {
    clientID: 'Your Client ID',
    clientSecret: 'Your Client Secret',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  linkedin: {
    consumerKey: "754zc72220f44d",
    consumerSecret: "TcOxRYSBUsAd8Ewf",
    callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback",
    profileFields: ['id', 'email-address', 'headline', 'industry', 'summary', 'positions', 'picture-url', 'skills', 'educations',],
    passReqToCallback: true
  },

};
