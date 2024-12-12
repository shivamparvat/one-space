import axios from "axios";

export default async function AiQurey(inputString) {
    try {
        const url = `http://192.168.1.15:8000/rank?query=${encodeURIComponent(inputString)}`;
        const response = await axios.post(url);
        return response.data; 
    } catch (error) {
        console.error('Error sending request:', error.message);
    }
}