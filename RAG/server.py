from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from typing import Optional
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from pymongo import MongoClient
import openai
import os
import numpy as np
import uvicorn
from gensim.utils import simple_preprocess
from scipy.linalg import norm
from docx import Document
import fitz  # PyMuPDF for PDFs
from PIL import Image
import io
import json

load_dotenv()

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI
app = FastAPI()

# MongoDB connection
mongo_client = MongoClient(os.getenv("MONGODB_URI"))
db = mongo_client["onespace"]
collection = db["embeddings"]

# LangChain embedding model setup
embedding_model = OpenAIEmbeddings()

# Text splitter for large files
text_splitter = CharacterTextSplitter(separator="\n", chunk_size=2000, chunk_overlap=200)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Service is running"}

def preprocess_text(text):
    """Preprocess text using Gensim's simple preprocessing for basic cleaning."""
    return " ".join(simple_preprocess(text))

def extract_text_from_file(file: UploadFile):
    """Extract text based on file type."""
    filename = file.filename.lower()
    mime_type = file.content_type

    # Read file content into memory
    file_content = file.file.read()

    if mime_type == "text/plain" or filename.endswith(".txt"):
        return file_content.decode('utf-8')
    
    elif mime_type == "application/pdf" or filename.endswith(".pdf"):
        doc = fitz.open("pdf", file_content)
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or filename.endswith(".docx"):
        doc = Document(io.BytesIO(file_content))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    elif mime_type.startswith("image/") or filename.endswith((".jpg", ".jpeg", ".png")):
        image = Image.open(io.BytesIO(file_content))
        # OCR processing (if necessary) can be added here
        return "Image text processing is not implemented in this example"

    else:
        raise ValueError(f"Unsupported file type: {mime_type}")


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None)
):
    try:
        # Extract text from the file
        raw_text = extract_text_from_file(file)
        
        file_metadata = json.loads(metadata) if metadata else {}

        # Preprocess the extracted text (e.g., remove unwanted characters, format)
        processed_text = preprocess_text(raw_text)

        # Split the processed text into chunks for embedding
        chunks = text_splitter.split_text(processed_text)

        # Insert each chunk along with its embedding into MongoDB
        for chunk in chunks:
            # Correct method for embedding using OpenAI API directly
            response = openai.Embedding.create(input=chunk, model="text-embedding-ada-002")
            embedding = response['data'][0]['embedding']  # Extract embedding from the response
            document = {
                "filename": file.filename,
                "content": chunk,
                "embedding": embedding,
                "metadata": file_metadata
            }
            collection.insert_one(document)

        # Return a success message
        return {"message": "File processed and added to MongoDB", "success": True}

    except ValueError as ve:
        # Raise an HTTPException for any value-related errors
        raise HTTPException(status_code=400, detail=str(ve))
    
    except Exception as e:
        # Catch any other unexpected errors and raise an HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rank")
async def rank_query(query: str):
    try:
        # Generate embedding for the query using OpenAI embeddings
        query_embedding = openai.Embedding.create(input=query, model="text-embedding-ada-002")['data'][0]['embedding']
        
        # Perform similarity search in MongoDB by cosine similarity
        results = []
        for doc in collection.find():
            embedding = np.array(doc["embedding"])
            similarity_score = np.dot(query_embedding, embedding) / (norm(query_embedding) * norm(embedding))
            results.append({
                "filename": doc["filename"],
                "content": doc["content"],
                "similarity_score": similarity_score
            })
        
        # Sort results by similarity score in descending order and return top results
        results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)[:5]
        
        # Debugging: Log similarity scores to check what’s happening
        print(f"Top similarity scores: {[result['similarity_score'] for result in results]}")
        
        # Generate a prompt for ChatGPT
        prompt = f"Answer the following question based on these documents. Pay special attention to the numbers, rates, and financial details:\n\nQuestion: {query}\n\n"
        for i, result in enumerate(results, start=1):
            prompt += f"Document {i}:\nContent: {result['content']}\n\n"
        
        prompt += "Provide a concise answer to the question based on the information above."

        # Get response from ChatGPT
        chat_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        # Retrieve and return the answer from ChatGPT
        answer = chat_response.choices[0].message["content"]
        
        return {"query": query, "answer": answer, "results": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
