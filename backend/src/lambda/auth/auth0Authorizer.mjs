import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'

import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('Todos: auth0Authorizer')
const jwksUrl =
  'https://dev-zy6vnxwx0t4c36aw.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  logger.info('Todos: verify token')

  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  const responseData = await Axios.get(jwksUrl)
  const JwkKeys = responseData.data.keys
  const signingKey = JwkKeys.find((key) => key.kid === jwt.header.kid)

  // Check singing key
  if (!signingKey) {
    logger.error('Todos: singing key is null')
    throw new Error('Error: singing key is not valid')
  }

  // create pem data
  const pemData = signingKey.x5c[0]

  // create certificate from pem data
  const certificate = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

  // verify token
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  logger.info('Todos: get token')

  if (!authHeader) throw new Error('Authentication header is null')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const splitData = authHeader.split(' ')
  return splitData[1]
}
