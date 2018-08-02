Accounts.registerLoginHandler(request => {
  if (!request.cordova_g_plus) {
    return
  }

  check(request.cordova_g_plus, Boolean)
  check(request.serverAuthCode, String)
  check(request.email, String)
  check(request.idToken, String)
  check(request.userId, String)

  const tokens = getTokens(request)
  const serviceData = getServiceDataFromTokens(tokens)
  return Accounts.updateOrCreateUserFromExternalService(
    'google',
    {
      id: request.userId,
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      email: request.email,
      picture: request.imageUrl,
      ...serviceData.serviceData
    },
    serviceData.options
  )
})

const getTokens = request => {
  const result = HTTP.post('https://www.googleapis.com/oauth2/v4/token', {
    params: {
      code: request.serverAuthCode,
      client_id:
        '788198230675-8b5vb3m7iari3v7c8a6n7bd4ao9hkis6.apps.googleusercontent.com',
      client_secret: 'L5EBtXBTKEY56kn0P23dCI5l',
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/_oauth/google'
    }
  })
  return {
    accessToken: result.data.access_token,
    expiresIn: result.data.expires_in,
    idToken: result.data.id_token,
    refreshToken: result.data.refresh_token
  }
}

const getServiceDataFromTokens = tokens => {
  const { accessToken, idToken } = tokens
  const scopes = getScopes(accessToken)
  const identity = getIdentity(accessToken)
  const serviceData = {
    accessToken,
    idToken,
    scope: scopes
  }

  if (hasOwn.call(tokens, 'expiresIn')) {
    serviceData.expiresAt = Date.now() + 1000 * parseInt(tokens.expiresIn, 10)
  }

  const fields = Object.create(null)
  whitelistedFields.forEach(function (name) {
    if (hasOwn.call(identity, name)) {
      fields[name] = identity[name]
    }
  })

  Object.assign(serviceData, fields)

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (tokens.refreshToken) {
    serviceData.refreshToken = tokens.refreshToken
  }

  return {
    serviceData,
    options: {
      profile: {
        name: identity.name
      }
    }
  }
}

const getIdentity = accessToken => {
  try {
    return HTTP.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token: accessToken }
    }).data
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to fetch identity from Google. ${err.message}`),
      { response: err.response }
    )
  }
}

const getScopes = accessToken => {
  try {
    return HTTP.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: accessToken }
    }).data.scope.split(' ')
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to fetch tokeninfo from Google. ${err.message}`),
      { response: err.response }
    )
  }
}

const hasOwn = Object.hasOwnProperty
const whitelistedFields = [
  'id',
  'email',
  'verified_email',
  'name',
  'given_name',
  'family_name',
  'picture',
  'locale',
  'timezone',
  'gender'
]
