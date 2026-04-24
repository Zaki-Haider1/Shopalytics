import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI shopping assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInputText('');

    // Mock AI response
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: "I can help with that! Let me analyze your request.", sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="chatbot-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window glass"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chatbot-header">
              <div className="flex items-center">
                <div className="bot-avatar"><Bot size={20} /></div>
                <div>
                  <h3 className="bot-title">AI Assistant</h3>
                  <span className="bot-status">Online</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="chatbot-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                  <div className="msg-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            
            <form className="chatbot-input" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default ChatbotWidget;
