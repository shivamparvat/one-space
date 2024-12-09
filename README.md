load file curl -X POST "http://localhost:8000/upload" \
  -F "file=@demo.txt"

python -m venv venv
bash => source venv/Scripts/activate
uvicorn server:app --host 0.0.0.0 --port 8000 --reload