import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import middy from '@middy/core'
import cors from '@middy/http-cors'
import { v4 as uuidv4 } from 'uuid'
import httpErrorHandler from '@middy/http-error-handler'
const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

// {
//   "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
// }

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10)

export const handler = middy(async (event) => {
  try {
    console.log('Event:', event)

    const { todoId } = event.pathParameters
    if (!todoId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Todo ID is required in the URL' })
      }
    }

    const imageId = uuidv4()
    const uploadUrl = await getUploadUrl(imageId)

    console.log('Event body:', event.body)
    await createImage(todoId, imageId, event.body)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl })
    }
  } catch (error) {
    console.error('Error creating image:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Could not create image' })
    }
  }
})
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))

async function createImage(id, imageId, body) {
  try {
    const timestamp = new Date().toISOString()
    const {
      Items: [valueDetail]
    } = await dynamoDbDocument
      .query({
        TableName: process.env.TODO_TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id
        }
      })
      .promise()

    const newItem = {
      ...valueDetail,
      id,
      timestamp,
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    console.log('DynamoDB new item:', newItem)
    await dynamoDbDocument
      .put({
        TableName: process.env.TODO_TABLE,
        Item: newItem
      })
      .promise()
  } catch (error) {
    console.error('Error creating image item in DynamoDB:', error)
    throw new Error('Could not create image item')
  }
}

async function getUploadUrl(imageId) {
  return s3.getSignedUrlPromise('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
