import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('Todos logger')

// {
//   "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
// }

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('generate upload url')
    const todoId = event.pathParameters.todoId

    const urlAttach = await createAttachmentPresignedUrl(todoId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        urlAttach
      })
    }
  })
