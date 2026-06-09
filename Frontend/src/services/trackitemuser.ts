import api from './api'

export const getItems = async () => {
  try {
    const response = await api.get('/trackitemuser')
    console.log('Track items fetched:', response.data)
    return { data: response.data }
  } catch (err: any) {
    console.error('Error fetching track items:', err.response?.data || err.message)
    throw err
  }
}

export const updateStatus = async (id: string | number, data: any) => {
  try {
    const response = await api.patch(`/trackitemuser/${id}`, data)
    console.log('Status updated:', response.data)
    return response.data
  } catch (err: any) {
    console.error('Error updating status:', err.response?.data || err.message)
    throw err
  }
}

export const createItem = async (data: any) => {
  try {
    const response = await api.post('/trackitemuser', data)
    console.log('Item created:', response.data)
    return response.data
  } catch (err: any) {
    console.error('Error creating item:', err.response?.data || err.message)
    throw err
  }
}

export const deleteItem = async (id: string | number) => {
  try {
    const response = await api.delete(`/trackitemuser/${id}`)
    console.log('Item deleted:', response.data)
    return response.data
  } catch (err: any) {
    console.error('Error deleting item:', err.response?.data || err.message)
    throw err
  }
}
