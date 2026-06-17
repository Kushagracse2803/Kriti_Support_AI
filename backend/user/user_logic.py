import os
from flask import Blueprint,request,jsonify
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import ollama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

#user blueprint initialization to link with app.py
user_bp = Blueprint('user_bp', __name__)

# Database folder path where the FAISS index is stored
FAISS_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "faiss_index")

#Local embedding structure loader
embeddings=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

@user_bp.route("/api/user/query", methods=["POST"])
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
        vector_store= FAISS_DATA_DIR,embeddings,allow_dangerous_deserialization=True
        #Establishing retriever for the vector store with a search parameter of k=3
        retriever=vector_store.as_retriever(search_kwargs={"k":3})
        #Binding with Low Latency LLM(ollama) and the retriever
        llm=ollama.Ollama(model="tinyllama",temperature=0.1)
        #SystemPrompt
        system_prompt = (
            "You are KIRTI_AI BOT, a next-generation enterprise helpdesk virtual assistant.\n"
            "Your sole objective is to deliver precise, highly structured corporate resolution rules to support agents.\n\n"
            "CRITICAL OPERATIONAL RULES:\n"
            "1. Always structure your responses beautifully using clear headings, bullet points, or numbered lists.\n"
            "2. Analyze the provided retrieved context context thoroughly and extract the exact clause answer.\n"
            "3. Rely strictly and ONLY on the provided context blocks. Do not synthesize outside intelligence or speculate.\n"
            "4. If the explicit factual resolution is missing or not addressed within the context, state exactly: 'Resolution clause not found within the active system rulebook.'\n\n"
            "Context Data Layout:\n{context}"
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

        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500