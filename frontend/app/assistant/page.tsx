'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import { assistantApi } from '../../src/services/api/assistantApi';
import { Mic, Send, Bot, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  intent?: string;
  actionRequired?: boolean;
  isError?: boolean;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  '"How much rice do we have?"',
  '"Which items are running low?"',
  '"What expires this week?"',
  '"Show me today\'s stock movements"',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ASSISTANT',
      text: 'Hello! I\'m the VoiceMate AI Assistant. I can answer questions about your inventory, low stock alerts, expiry, and recent transactions — using live data from your database.\n\nFor stock changes, please use the Voice Console.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'USER',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await assistantApi.queryAssistant(text.trim());

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'ASSISTANT',
        text: response.reply,
        intent: response.intent,
        actionRequired: response.action_required,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Optional TTS for spoken_text
      if (response.spoken_text && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.spoken_text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-e`,
        sender: 'ASSISTANT',
        text: err.message?.includes('503') || err.message?.includes('unavailable')
          ? 'The AI assistant is temporarily unavailable. Please check your Groq API key configuration in backend/.env'
          : `Sorry, I encountered an error: ${err.message || 'Unknown error'}`,
        isError: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(inputValue);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-[var(--text-primary)] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          title="Intelligence & Chat"
          description="AI powered analytics and queries"
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ASSISTANT' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-blue-400 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap
                ${msg.sender === 'USER'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : msg.isError
                  ? 'bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--text-primary)] rounded-bl-sm'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-sm'
                }`}
              >
                {msg.isError && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                    <span className="text-[11px] font-semibold text-[var(--danger)]">ERROR</span>
                  </div>
                )}
                {msg.actionRequired && (
                  <div className="flex items-center gap-1.5 mb-2 text-[var(--warning)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Use Voice Console for stock changes</span>
                  </div>
                )}
                {msg.text}
                <div className="text-[10px] mt-1.5 opacity-50 text-right" suppressHydrationWarning>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-blue-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                <span className="text-[12px] text-[var(--text-muted)]">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested queries */}
        {messages.length <= 2 && (
          <div className="px-4 lg:px-8 pb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => handleSubmit(q.replace(/"/g, ''))}
                className="text-[12px] text-[var(--text-secondary)] border border-[var(--border)] px-3 py-1.5 rounded-full hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about stock, expiry, transactions, or replenishment..."
              className="flex-1 bg-[var(--surface-low)] border border-[var(--border)] rounded-xl px-4 py-3 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => handleSubmit(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
