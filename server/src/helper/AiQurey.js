import axios from "axios";

export default async function AiQurey(inputString,user_id,organization) {
    try {
        const url = `http://${process.env.RAG_HOST}:8000/rank?query=${encodeURIComponent(inputString)}&user_id=${user_id}&organization=${organization}`;
        const response = await axios.post(url);
        return response.data; 
    } catch (error) {
        console.error('Error sending request:', error.message);
    }
}