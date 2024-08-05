import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import { handler as getUserId } from '../auth/userId.js'
import httpErrorHandler from '@middy/http-error-handler'
/**
 * {
    "name": "Buy bread",
    "dueDate": "2022-12-12",
    "done": true
}
 */
const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())
const todoTable = process.env.TODO_TABLE

export const handler = middy(async (event) => {
  try {
    const parsedBody = JSON.parse(event.body)
    console.log('Parsed request body:', parsedBody)

    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)
    console.log('User ID:', userId)

    const newItem = {
      ...parsedBody,
      userId,
      createdAt: new Date().toISOString()
    }

    await dynamoDbDocument
      .put({
        TableName: todoTable,
        Item: newItem
      })
      .promise()

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ item: newItem })
    }
  } catch (error) {
    console.error('Error creating new item:', error)

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not create item' })
    }
  }
})
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
