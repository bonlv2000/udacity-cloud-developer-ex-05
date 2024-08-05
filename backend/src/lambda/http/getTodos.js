import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import { handler as getUserId } from '../auth/userId.js'
import httpErrorHandler from '@middy/http-error-handler'

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

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())
const todoTable = process.env.TODO_TABLE

export const handler = middy(async (event) => {
  try {
    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)
    console.log('Fetching todos for userId:', userId)

    const result = await dynamoDbDocument
      .scan({
        TableName: todoTable,
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    console.log('Scan result:', result)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ items: result.Items })
    }
  } catch (error) {
    console.error('Error fetching todos:', error)

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not fetch todos' })
    }
  }
})
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
