import axios from "axios";

export default async function fetch(url: string, retryCount: number = 0) {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    if (retryCount <= 0) throw error;
    return fetch(url, retryCount - 1);
  }
}
