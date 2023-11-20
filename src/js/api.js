import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export const BASE_URL = 'https://pixabay.com/api/';
export const API_KEY = '40717223-2bc60fe276e82255cc8c662af';
export const options = {
    params: {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: 1,
    q: '',
  },
}

export async function fetchImages() {
  try {
    const response = await axios.get(BASE_URL, options);
    return response.data;
  } catch (error) {
    Notify.failure(error);
    throw error;
  }
}
  
