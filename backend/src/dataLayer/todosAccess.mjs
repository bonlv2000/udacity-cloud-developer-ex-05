import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger.mjs'

const XAWS = AWSXRay.captureAWS(AWS)
const documentClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const todosIndex = process.env.INDEX_NAME
const logger = createLogger('TodosAccess')

export class TodosAccess {
  async getTodos(userId) {
    logger.info(`Fetching todos for user ${userId}`)

    try {
      const result = await documentClient
        .query({
          TableName: todosTable,
          IndexName: todosIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId }
        })
        .promise()

      return result.Items
    } catch (error) {
      logger.error(`Error fetching todos: ${error}`)
      throw new Error('Error fetching todos')
    }
  }

  async createTodo(newItem) {
    logger.info('Creating a new todo item')

    try {
      await documentClient
        .put({
          TableName: todosTable,
          Item: newItem
        })
        .promise()

      logger.info(`Todo item created: ${JSON.stringify(newItem)}`)
      return newItem
    } catch (error) {
      logger.error(`Error creating todo: ${error}`)
      throw new Error('Error creating todo')
    }
  }

  async updateTodo(userId, todoId, updateItem) {
    logger.info(`Updating todo item with ID ${todoId} for user ${userId}`)

    try {
      const result = await documentClient
        .update({
          TableName: todosTable,
          Key: { userId, todoId },
          UpdateExpression:
            'set #name = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': updateItem.name,
            ':dueDate': updateItem.dueDate,
            ':done': updateItem.done
          },
          ExpressionAttributeNames: { '#name': 'name' },
          ReturnValues: 'UPDATED_NEW'
        })
        .promise()

      return result.Attributes
    } catch (error) {
      logger.error(`Error updating todo: ${error}`)
      throw new Error('Error updating todo')
    }
  }

  async deleteTodo(userId, todoId) {
    logger.info(`Deleting todo item with ID ${todoId} for user ${userId}`)

    try {
      const result = await documentClient
        .delete({
          TableName: todosTable,
          Key: { userId, todoId }
        })
        .promise()

      logger.info('Todo item deleted', result)
      return result
    } catch (error) {
      logger.error(`Error deleting todo: ${error}`)
      throw new Error('Error deleting todo')
    }
  }

  async updateTodoAttachmentUrl(userId, todoId, attachmentUrl) {
    logger.info(`Updating attachment URL for todo ${todoId} for user ${userId}`)

    try {
      await documentClient
        .update({
          TableName: todosTable,
          Key: { userId, todoId },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: { ':attachmentUrl': attachmentUrl }
        })
        .promise()
    } catch (error) {
      logger.error(`Error updating attachment URL: ${error}`)
      throw new Error('Error updating attachment URL')
    }
  }
}
