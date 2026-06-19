import os
from flask import Blueprint,request,jsonify
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

#user blueprint initialization to link with app.py
user_bp = Blueprint('user_bp', __name__)

# Database folder path where the FAISS index is stored
FAISS_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "faiss_index")

#Local embedding structure loader
embeddings=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

@user_bp.route("/query", methods=["POST"])
def chat_with_bot():
    data=request.json or {}
    user_query=data.get("query","")
    
    # Error print the strings converted to clean professional English
    if not user_query:
        return jsonify({"error": "Query is required."}), 400
    # Validation constraint check for  pre existing vector store
    if not os.path.exists(FAISS_DATA_DIR):
        return jsonify({"error": "No vector store found. Please upload a rule book first."}), 400
    try:
        vector_store= FAISS.load_local(FAISS_DATA_DIR, embeddings, allow_dangerous_deserialization=True)
        #Establishing retriever for the vector store with a search parameter of k=3
        retriever=vector_store.as_retriever(search_kwargs={"k":3})
        #Binding with Low Latency LLM(ollama) and the retriever
        llm=Ollama(model="tinyllama",temperature=0.1)
        #SystemPrompt
        # SystemPrompt - Fully Optimized for Rich, Structured & Enterprise-Grade Responses
        system_prompt = (
           "You are KIRTI_AI, a helpful support bot.\n"
            "Answer the query using ONLY the context provided below. Keep it short and to the point.\n"
            "If the answer is not in the context, say: 'Resolution clause not found.'\n\n"
            "Context:\n{context}"
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        #Creating a retrieval chain with the retriever and the LLM
        document_chain = create_stuff_documents_chain(llm=llm, prompt=prompt)
        rag_chain=create_retrieval_chain(retriever,document_chain)

        #Dispatching the user query through the RAG chain to get the response
        response=rag_chain.invoke({"input":user_query})

        return jsonify({"response": response["answer"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500