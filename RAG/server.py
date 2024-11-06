from fastapi import FastAPI, File, UploadFile, HTTPException
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from pymongo import MongoClient
import openai
import os
import numpy as np
import uvicorn
from gensim.utils import simple_preprocess
from docx import Document
import fitz  # PyMuPDF for PDFs
from PIL import Image
import io

# Configure OpenAI API key
openai.api_key = os.getenv("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")

# Initialize FastAPI
app = FastAPI()

# MongoDB connection
# mongo_client = MongoClient("mongodb+srv://shivamgoswami2711:VOn1bkb4grXSSQTd@onespace.9hxaj.mongodb.net")  # Replace with your MongoDB URI
# db = mongo_client["onespace"]
# collection = db["embeddings"]

# # LangChain embedding model setup
# embedding_model = OpenAIEmbeddings()

# # Text splitter for large files
# text_splitter = CharacterTextSplitter(separator="\n", chunk_size=2000, chunk_overlap=200)


@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Service is running"}    

# def preprocess_text(text):
#     """Preprocess text using Gensim's simple preprocessing for basic cleaning."""
#     return " ".join(simple_preprocess(text))

# def extract_text_from_file(file: UploadFile):
#     """Extract text based on file type."""
#     filename = file.filename.lower()
    
#     if filename.endswith(".txt"):
#         return file.file.read().decode('utf-8')
    
#     elif filename.endswith(".pdf"):
#         doc = fitz.open("pdf", file.file.read())
#         text = ""
#         for page in doc:
#             text += page.get_text()
#         return text
    
#     elif filename.endswith(".docx"):
#         doc = Document(file.file)
#         text = "\n".join([para.text for para in doc.paragraphs])
#         return text

#     elif filename.endswith((".jpg", ".jpeg", ".png")):
#         image = Image.open(io.BytesIO(file.file.read()))
#         # Perform OCR here if required, but for simplicity, we're returning a placeholder
#         return "Image text processing is not implemented in this example"
    
#     else:
#         raise ValueError("Unsupported file type")


# @app.post("/upload")
# async def upload_file(file: UploadFile = File(...)):
#     try:
#         # Extract and preprocess text
#         raw_text = extract_text_from_file(file)
#         processed_text = preprocess_text(raw_text)
        
#         # Split and generate embeddings
#         chunks = text_splitter.split_text(processed_text)
#         for chunk in chunks:
#             embedding = embedding_model.embed_text(chunk)
#             document = {
#                 "filename": file.filename,
#                 "content": chunk,
#                 "embedding": embedding
#             }
#             collection.insert_one(document)
        
#         return {"message": "File processed and added to MongoDB"}
#     except ValueError as ve:
#         raise HTTPException(status_code=400, detail=str(ve))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/rank")
# async def rank_query(query: str):
#     try:
#         # Generate embedding for the query
#         query_embedding = embedding_model.embed_text(query)
        
#         # Perform similarity search in MongoDB by cosine similarity
#         results = []
#         for doc in collection.find():
#             embedding = np.array(doc["embedding"])
#             similarity_score = np.dot(query_embedding, embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(embedding))
#             results.append({
#                 "filename": doc["filename"],
#                 "content": doc["content"],
#                 "similarity_score": similarity_score
#             })
        
#         # Sort results by similarity score in descending order and return top results
#         results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)[:5]
        
#         return {"results": results}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
