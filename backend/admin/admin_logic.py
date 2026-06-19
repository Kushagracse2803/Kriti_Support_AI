import os
from flask import Blueprint, request, jsonify  # 1. Fixed: Blueprint (small 'p')
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Initializing blueprint to connect with app.py
admin_bp = Blueprint('admin_bp', __name__)  # Fixed: Blueprint (small 'p')

# Database folder path where the FAISS index will be stored
FAISS_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "faiss_index")

# Embedding model loaded
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

@admin_bp.route("/upload_pdf", methods=["POST"])
def upload_rulebook():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(os.path.dirname(__file__), file.filename)
        file.save(file_path)

        try:
            loader = PyPDFLoader(file_path)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
            docs = text_splitter.split_documents(loader.load())

            db = FAISS.from_documents(docs, embeddings)
            db.save_local(FAISS_DATA_DIR)

            os.remove(file_path)
            return jsonify({"message": "Rule book uploaded successfully AND LOCAL VECTOR CREATED"}), 200
            
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"error": str(e)}), 500

    # 2. Fixed: Aligned properly inside the function (4 spaces given)
    return jsonify({"error": "Invalid file format. Please upload a PDF file."}), 400