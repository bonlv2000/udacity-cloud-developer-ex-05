import { v4 as uuidv4 } from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { createLogger } from '../utils/logger.mjs'
import { commonAttachmentUtil } from '../fileStorage/attachmentUtils.mjs'

const logger = createLogger('Todos:BusinessLogic')
const todosAccess = new TodosAccess()
const attachmentUtil = new commonAttachmentUtil()

export async function getTodos(userId) {
  logger.info(`Fetching todos for user ${userId}`)
  try {
    return await todosAccess.getTodos(userId)
  } catch (error) {
    logger.error(`Error fetching todos: ${error}`)
    throw new Error('Error fetching todos')
  }
}

export async function createTodo(newTodo, userId) {
  logger.info(`Creating todo for user ${userId}`)
  const todoId = uuidv4()
  const createdAt = new Date().toISOString()

  try {
    const attachmentUrl = await attachmentUtil.createAttachmentUrl(todoId)
    const newItem = {
      todoId,
      userId,
      attachmentUrl,
      createdAt,
      done: false,
      ...newTodo
    }
    return await todosAccess.createTodo(newItem)
  } catch (error) {
    logger.error(`Error creating todo: ${error}`)
    throw new Error('Error creating todo')
  }
}

export async function updateTodo(userId, todoId, todoUpdate) {
  logger.info(`Updating todo ${todoId} for user ${userId}`)
  try {
    return await todosAccess.updateTodo(userId, todoId, todoUpdate)
  } catch (error) {
    logger.error(`Error updating todo: ${error}`)
    throw new Error('Error updating todo')
  }
}

export async function deleteTodo(todoId, userId) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`)
  try {
    return await todosAccess.deleteTodo(todoId, userId)
  } catch (error) {
    logger.error(`Error deleting todo: ${error}`)
    throw new Error('Error deleting todo')
  }
}

export async function createAttachmentPresignedUrl(todoId) {
  logger.info(`Creating attachment presigned URL for todo ${todoId}`)
  try {
    return await attachmentUtil.createUploadUrl(todoId)
  } catch (error) {
    logger.error(`Error creating attachment URL: ${error}`)
    throw new Error('Error creating attachment URL')
  }
}
