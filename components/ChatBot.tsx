import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { createAssistantChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat, GenerateContentResponse } from "@google/genai";

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Bonjour ! Je suis l'assistant Cash-flow AI. Comment puis-je vous aider à gérer votre trésorerie aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session once
    if (!chatSessionRef.current) {
      chatSessionRef.current = createAssistantChat();
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "Désolé, je n'ai pas pu générer de réponse.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:bg-blue-700 transition-all hover:scale-105 z-50 flex items-center justify-center group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden transition-all duration-300 flex flex-col ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="bg-secondary p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
             <h3 className="font-bold text-white text-sm">Assistant Cash-flow</h3>
             <p className="text-xs text-slate-300 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> En ligne
             </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="hover:text-white p-1 rounded hover:bg-white/10"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-md shadow-blue-100'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Posez une question..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};