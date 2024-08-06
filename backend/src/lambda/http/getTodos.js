import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

import { getUserId } from '../utils.mjs'
import { getTodos } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('Todos logger')

// {
//   "items": [
//     {
//       "todoId":"605525c4-d36c-1234-b3ff-65b853344123",
//       "userId":"google-oauth2|115783759495544745774",
//       "attachmentUrl":"https://serverless-c4-todo-images.s3.amazonaws.com/605525c4-1234-4d23-b3ff-65b853344123",
//       "dueDate":"2022-12-12",
//       "createdAt":"2022-11-28T22:04:08.613Z",
//       "name":"Buy bread",
//       "done":false
//     }
//   ]
// }

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('get todo item')
    const userId = getUserId(event)
    const todoItems = await getTodos(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todoItems
      })
    }
  })
