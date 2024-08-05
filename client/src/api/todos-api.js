import Axios from 'axios'

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT

const axiosInstance = Axios.create({
  baseURL: apiEndpoint,
  headers: {
    'Content-Type': 'application/json'
  }
})

function setAuthHeader(idToken) {
  return {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  }
}

export async function getTodos(idToken) {
  try {
    console.log('Fetching todos')
    const response = await axiosInstance.get('/todos', setAuthHeader(idToken))
    console.log('Todos:', response.data)
    return response.data.items
  } catch (error) {
    console.error('Error fetching todos:', error)
    throw error
  }
}

export async function createTodo(idToken, newTodo) {
  try {
    const response = await axiosInstance.post(
      '/todos',
      JSON.stringify(newTodo),
      setAuthHeader(idToken)
    )
    return response.data.item
  } catch (error) {
    console.error('Error creating todo:', error)
    throw error
  }
}

export async function patchTodo(idToken, updatedTodo) {
  try {
    await axiosInstance.patch(
      '/todos',
      JSON.stringify(updatedTodo),
      setAuthHeader(idToken)
    )
  } catch (error) {
    console.error('Error updating todo:', error)
    throw error
  }
}

export async function deleteTodo(idToken, id) {
  try {
    await axiosInstance.delete('/todos', {
      ...setAuthHeader(idToken),
      data: { id }
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    throw error
  }
}

export async function getUploadUrl(idToken, id) {
  try {
    const response = await axiosInstance.post(
      `/todos/attachment/${id}`,
      '',
      setAuthHeader(idToken)
    )
    return response.data.uploadUrl
  } catch (error) {
    console.error('Error getting upload URL:', error)
    throw error
  }
}

export async function uploadFile(uploadUrl, file) {
  try {
    await Axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': 'image/png'
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}
