Package.describe({
  documentation: 'README.md',
  git: 'https://github.com/sujith3g/meteor-cordova-google-plus.git',
  name: 'hedcet:cordova-google-plus-native-sign-in',
  summary: 'native SignIn with Google Plus in Meteor Cordova Android/IOS App',
  version: '1.1.4'
})

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0')

  api.use(['accounts-base', 'check'], ['client', 'server'])
  api.use(['accounts-password', 'http', 'underscore'], ['server'])

  api.imply(['accounts-base'], ['client', 'server'])

  api.addFiles(['server/cordova_g_plus.js'], ['server'])
  api.addFiles(['cordova/cordova_g_plus.js'], ['web.cordova'])
})

Package.onTest(function (api) {
  api.use(['hedcet:cordova-google-plus-native-sign-in', 'tinytest'])

  api.addFiles('tests/client/cordova_g_plus_test.js', 'client')
})
