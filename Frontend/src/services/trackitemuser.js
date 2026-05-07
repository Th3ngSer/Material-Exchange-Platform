import axios from 'axios'

const API = 'http://localhost:3000/trackitemuser'

export const getItems = () => axios.get(API)

export const updateStatus = (id, data) =>
  axios.patch(`${API}/${id}`, data)

export const createItem = (data) =>
  axios.post(API, data)