import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing', 'admin', 'user'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Admin States
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (currentView === "user") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentView]);

  // --- Backend Handlers ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    // 🛠️ Updated Log: Showing FAISS indexing layer accurately
    setUploadStatus("Uploading & Indexing into Local FAISS Space...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🎯 Fixed API Path: Target mapped directly to /api/admin/upload_pdf
      const response = await fetch("http://localhost:5000/api/admin/upload_pdf", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus(`Success: ${data.message || "Rulebook index ho gayi!"}`);
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus("Backend server running nahi hai ya connect nahi ho paa raha.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setInputText("");
    setChatLoading(true);

    try {
      // 🎯 Fixed API Path: Target mapped directly to /api/user/query
      const response = await fetch("http://localhost:5000/api/user/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.response || "No response received." }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Server connectivity issue. Check if Flask is running on port 5000." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ----------------------------------------------------
  // VIEW 1: Center-Aligned Landing Screen
  // ----------------------------------------------------
  if (currentView === "landing") {
    return (
      <div className="main-container central-flex">
        <div className="gradient-glow"></div>
        <div className="landing-card-wrapper w-full max-w-4xl px-4">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight" style={{ fontWeight: 800 }}>
              Kriti Support AI
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              Enterprise Helpdesk RAG Framework
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Admin Block Card */}
            <motion.div 
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView("admin")}
              className="p-8 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-md hover:border-purple-500 transition-all text-center flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="text-4xl mb-4 p-4 bg-purple-600/10 text-purple-400 rounded-full">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-1">Admin Dashboard</h3>
              <p className="text-xs text-gray-400">Upload rules, policy books and documentation PDFs</p>
            </motion.div>

            {/* User Block Card */}
            <motion.div 
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView("user")}
              className="p-8 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-md hover:border-pink-500 transition-all text-center flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="text-4xl mb-4 p-4 bg-pink-600/10 text-pink-400 rounded-full">💬</div>
              <h3 className="text-xl font-bold text-white mb-1">User Support Desk</h3>
              <p className="text-xs text-gray-400">Interact with the local/API-based SLM Smart Assistant</p>
            </motion.div>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: Dedicated Admin Upload Screen
  // ----------------------------------------------------
  if (currentView === "admin") {
    return (
      <div className="main-container">
        <div className="gradient-glow"></div>
        <div className="content-wrapper flex-col p-6 max-w-4xl mx-auto w-full">
          
          <header className="header" style={{ borderBottom: '1px solid var(--border-gray-800)', padding: '1rem 0' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => { setCurrentView("landing"); setUploadStatus(""); setSelectedFile(null); }} className="back-btn">
                ← Back
              </button>
              <h1 className="header-title style-override-title" style={{ marginLeft: '15px', fontSize: '1.25rem' }}>Admin Upload Center</h1>
            </div>
          </header>

          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 backdrop-blur-md mt-10">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Feed Corporate Rulebooks</h3>
            <p className="text-sm text-gray-400 mb-6">
              Upload company support guidelines (.pdf, .docx, .txt). The system will automatically chunk and save text embeddings into local FAISS vector database layer.
            </p>

            <div 
              className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-2xl p-12 text-center bg-black/40 cursor-pointer transition-all"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
              />
              <span className="text-5xl mb-4 block">📥</span>
              <p className="text-base text-gray-200 font-semibold">
                {selectedFile ? `Selected: ${selectedFile.name}` : "Click here to browse your file"}
              </p>
              <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, TXT</p>
            </div>

            {uploadStatus && (
              <div className="mt-6 text-sm font-mono p-4 bg-black/80 rounded-xl text-purple-400 border border-gray-800">
                <strong>Logs:</strong> {uploadStatus}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: Dedicated User Screen (Elysium AI Twin UI - Sticked Bottom)
  // ----------------------------------------------------
  if (currentView === "user") {
    return (
      <div className="main-container text-to-text-layout">
        <div className="gradient-glow"></div>
        <div className="chat-layout layout-full-stretch">
          
          {/* Header Layout */}
          <header className="header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button onClick={() => setCurrentView("landing")} className="back-btn">
                ← Back
              </button>
              <h1 className="header-title">Kriti Support AI</h1>
            </div>
            <div className="header-auth">
              <span style={{ fontSize: "12px", color: "var(--text-gray-400)", fontFamily: "monospace" }}>
                SLM ACTIVE
              </span>
            </div>
          </header>

          {/* Main Chat Area - Expanded to push footer down */}
          <main className="chat-container custom-chat-scroller">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <h2>Hello, how can I help you today?</h2>
                  <p style={{ color: "var(--text-gray-400)", fontSize: "14px", marginTop: "10px" }}>
                    Ask me any customer query based on the active company rules manual.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="message-wrapper">
                    <div className={`avatar ${msg.sender === "user" ? "user" : "ai"}`}></div>
                    <div>
                      <p className="sender-name">
                        {msg.sender === "user" ? "You" : "KRITI SUPPORT AI"}
                      </p>
                      <p className="message-text">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="message-wrapper">
                  <div className="avatar ai"></div>
                  <div>
                    <p className="sender-name">KRITI SUPPORT AI</p>
                    <p className="message-text" style={{ color: "var(--text-gray-500)", fontStyle: "italic" }}>
                      Searching knowledge base and thinking...
                    </p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </main>

          {/* Input Form Sticked to Bottom */}
          <footer className="chat-footer absolute-bottom-footer">
            <div className="input-form">
              <input 
                type="text" 
                placeholder="Message AI..."
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                style={{ paddingLeft: "1.5rem", paddingRight: "6.5rem" }}
              />

              <button 
                type="submit" 
                className="send-button" 
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
            <p className="footer-disclaimer" style={{ textAlign: "center", color: "var(--text-gray-500)", fontSize: "11px", marginTop: "8px", width: "100%" }}>
              AI may display inaccurate info, so double-check its responses.
            </p>
          </footer>

        </div>
      </div>
    );
  }
}