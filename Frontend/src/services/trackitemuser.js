import axios from 'axios'

const API = 'http://localhost:3000/api/trackitemuser'

// Get auth token from sessionStorage (per-tab)
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

export const getItems = async () => {
  try {
    const response = await axios.get(API, getAuthHeaders())
    console.log('Track items fetched:', response.data)
    return { data: response.data }
  } catch (err) {
    console.error('Error fetching track items:', err.response?.data || err.message)
    throw err
  }
}

export const updateStatus = async (id, data) => {
  try {
    const response = await axios.patch(`${API}/${id}`, data, getAuthHeaders())
    console.log('Status updated:', response.data)
    return response.data
  } catch (err) {
    console.error('Error updating status:', err.response?.data || err.message)
    throw err
  }
}

export const createItem = async (data) => {
  try {
    const response = await axios.post(API, data, getAuthHeaders())
    console.log('Item created:', response.data)
    return response.data
  } catch (err) {
    console.error('Error creating item:', err.response?.data || err.message)
    throw err
  }
}
