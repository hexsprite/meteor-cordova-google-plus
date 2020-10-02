/*
 * @function cordova_g_plus(request, callback)
 * @summary function to call native google-plus signIn in cordova only
 * 
 * @param {Boolean} 'request.cordova_g_plus' expected 'true' to call signIn server handle
 * @param {Array} 'request.profile' required properties in user.profile (copied fron response), ex: `["email", "email_verified", "family_name", "gender", "given_name", "locale", "picture"]`
 * 
 * @param {function} 'callback' only 'error' arg if any
 */
const scopes = [
  // 'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.app.created',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

Meteor.cordova_g_plus = function (request, callback, scopes=scopes) {
  window.plugins.googleplus.login(
    {
      scopes,
      offline: true,
      webClientId: request.webClientId
    },

    function (response) {
      request.email = response.email
      request.idToken = response.idToken
      request.userId = response.userId
      request.serverAuthCode = response.serverAuthCode

      Accounts.callLoginMethod({
        methodArguments: [request],
        userCallback: callback
      })
    },

    function (error) {
      if (callback && typeof callback == 'function') {
        callback(error)
      }
    }
  )
}
