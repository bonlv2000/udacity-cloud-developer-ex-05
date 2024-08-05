import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
/**
 * {
      "id":""
    }
 */
const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())
const todoTable = process.env.TODO_TABLE

export const handler = middy(async (event) => {
  try {
    const parsedBody = JSON.parse(event.body)
    const { id } = parsedBody
    console.log('Delete request for ID:', id)

    await dynamoDbDocument.delete({
      TableName: todoTable,
      Key: { id }
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id })
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not delete item' })
    }
  }
})
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
