# 🤖 Kriti Support AI

**Kriti Support AI** is a next-generation, enterprise-ready **RAG (Retrieval-Augmented Generation)** customer service helpdesk ecosystem. Built with a premium, sleek dark-themed React.js frontend (inspired by the Elysium AI architecture) and a robust Flask backend pipeline, it empowers support agents to resolve customer issues instantly without needing prior knowledge of complex corporate rulebooks.

---

## 🚀 Key Features

*   **Dual Dashboard Architecture**: Complete modular separation between Administrative management tools and User/Agent interaction workflows.
*   **Persistent Vector Engine**: Seamless extraction, processing, and indexing of unstructured corporate policy data (PDF, DOCX, TXT) into a local **ChromaDB** layer.
*   **Contextual SLM Guardrails**: Powered by high-speed, low-latency Small Language Models (SLMs) via Groq API to deliver definitive, rulebook-bound solutions without hallucination.
*   **Elysium-Twin Chat View**: A fully optimized, center-aligned message thread with a responsive sticky bottom input bar for a seamless user experience.

---

## 🛠️ The Tech Stack

| Layer | Technology Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) + Framer Motion | Fluid animations & High-performance state-driven UI |
| **Backend API** | Flask + Flask-CORS | REST API orchestration & cross-origin bridging |
| **Vector DB** | ChromaDB | Local storage and persistence of text embeddings |
| **Embeddings** | HuggingFace (`all-MiniLM-L6-v2`) | Free, resource-efficient local semantic parsing |
| **LLM Engine** | ChatGroq (`llama3-8b-8192`) | Ultrafast processing of dynamic context-bound queries |

---

## 📂 Project Architecture

```text
Kriti-Support-AI/
│
├── backend/
│   ├── app.py                 # Flask API Controller & Endpoints
│   ├── rag_pipeline.py       # Chunking, Embedding & Retrieval Core
│   ├── requirements.txt       # Python Dependencies
│   └── data/                  # ChromaDB Persistent Storage Directory (Git Ignored)
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Dynamic Landing, Admin & User Views
    │   ├── App.css            # Custom Styling & Sticked Alignment Layouts
    │   └── main.jsx           # React Dom Mounting Point
    ├── package.json           # Scripts & Dependencies configuration
    └── .gitignore             # Multilayer Git tracking controller
