'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import { ConversationalService, ConversationalResponse } from '../../lib/assistant/conversationalService';
import { InventoryService } from '../../lib/inventory/services/inventoryService';
import { LocalProductRepository } from '../../lib/inventory/repositories/productRepository';
import { LocalTransactionRepository } from '../../lib/inventory/repositories/transactionRepository';
import { unitService } from '../../lib/inventory/units/unitService';
import { SpeechAdapter } from '../../lib/voice/speechAdapter';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  widgetType?: ConversationalResponse['widgetType'];
  dataPayload?: any;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [conversationalService, setConversationalService] = useState<ConversationalService | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechAdapterRef = useRef<SpeechAdapter | null>(null);

  useEffect(() => {
    // Initialize services
    const productRepo = new LocalProductRepository();
    const txRepo = new LocalTransactionRepository();
    const invService = new InventoryService(productRepo, txRepo);
    
    // Attempt to initialize speech, though it might need user interaction to unlock
    try {
      const config = {
        onStateChange: () => {},
        onResult: () => {},
        onError: () => {}
      };
      const speech = new SpeechAdapter(config);
      speechAdapterRef.current = speech;
      setConversationalService(new ConversationalService(invService, speech));
    } catch (e) {
      console.warn('Speech synthesis not available yet.');
      setConversationalService(new ConversationalService(invService, null));
    }

    // Add initial greeting
    setMessages([
      {
        id: 'msg-0',
        sender: 'ASSISTANT',
        text: 'Hello. I am the VoiceMate Conversational Assistant. How can I help you manage the inventory today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || !conversationalService) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'USER',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Process query
    try {
      const response = await conversationalService.handleQuery(text);
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'ASSISTANT',
        text: response.text,
        widgetType: response.widgetType,
        dataPayload: response.dataPayload,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        sender: 'ASSISTANT',
        text: 'Sorry, I encountered an error while trying to process that request.',
        timestamp: new Date()
      }]);
    }
  };

  const handleVoiceToggle = () => {
    if (!speechAdapterRef.current) return;
    
    if (isListening) {
      setIsListening(false);
      // In a real implementation, we'd stop the speech recognition here.
      // For this prototype, the speechAdapter is mainly output. 
      // We would use useVoicePipeline if we wanted full voice input again.
      // But for simplicity in the assistant, we can rely on standard Web Speech API.
    } else {
      setIsListening(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          handleSubmit(transcript);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
        setIsListening(false);
      }
    }
  };

  const renderWidget = (msg: ChatMessage) => {
    if (!msg.widgetType || !msg.dataPayload) return null;

    switch (msg.widgetType) {
      case 'STOCK':
        const prod = msg.dataPayload.product;
        return (
          <div className="mt-3 bg-white border border-[#E5E5E0] rounded-lg p-4 shadow-sm w-full max-w-sm">
            <p className="text-[10px] font-bold text-[#2457FF] uppercase tracking-wider mb-1">Product Stock Info</p>
            <h4 className="text-[14px] font-bold text-[#111318]">{prod.name}</h4>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-[#111318] leading-none">{prod.currentStock}</span>
              <span className="text-[12px] text-[#5F6673]">{prod.baseUnit}</span>
            </div>
          </div>
        );
      
      case 'LOW_STOCK':
      case 'REORDER':
        const products = msg.dataPayload.products;
        return (
          <div className="mt-3 bg-white border border-[#E5E5E0] rounded-lg p-4 shadow-sm w-full max-w-md">
            <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider mb-2">Attention Required</p>
            <div className="space-y-2">
              {products.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center bg-[#F9F9F8] p-2 rounded border border-[#E5E5E0]">
                  <span className="text-[12px] font-bold text-[#111318]">{p.name}</span>
                  <div className="text-right">
                    <span className="text-[12px] font-bold text-[#C2410C]">{p.currentStock} {p.baseUnit}</span>
                    <span className="text-[10px] text-[#5F6673] ml-2">(Min: {p.reorderLevel})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'TRANSACTIONS':
        const txs = msg.dataPayload.transactions;
        return (
          <div className="mt-3 bg-white border border-[#E5E5E0] rounded-lg p-4 shadow-sm w-full max-w-md">
            <p className="text-[10px] font-bold text-[#16794A] uppercase tracking-wider mb-2">Recent Ledger Entries</p>
            <div className="space-y-2">
              {txs.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center bg-[#F9F9F8] p-2 rounded border border-[#E5E5E0]">
                  <div>
                    <span className="text-[12px] font-bold text-[#111318] block">{tx.productName}</span>
                    <span className="text-[10px] text-[#5F6673]">{new Date(tx.createdAt).toLocaleTimeString()} • {tx.source}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[12px] font-bold ${tx.type === 'STOCK_IN' ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                      {tx.type === 'STOCK_OUT' ? '-' : '+'}{tx.quantity} {tx.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'EXPIRY':
        const summary = msg.dataPayload.summary;
        return (
          <div className="mt-3 bg-white border border-[#E5E5E0] rounded-lg p-4 shadow-sm w-full max-w-sm">
            <p className="text-[10px] font-bold text-[#C2410C] uppercase tracking-wider mb-2">Shelf Clock Alerts</p>
            <div className="flex gap-4">
              <div className="bg-[#FEF2ED] text-[#C2410C] p-2 rounded text-center flex-1">
                <p className="text-[18px] font-bold">{summary.expired}</p>
                <p className="text-[10px] font-bold">EXPIRED</p>
              </div>
              <div className="bg-[#FFF4E5] text-[#9A3412] p-2 rounded text-center flex-1">
                <p className="text-[18px] font-bold">{summary.expiringSoon}</p>
                <p className="text-[10px] font-bold">EXPIRING SOON</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader customStatus="ASSISTANT ACTIVE" />

        <main className="flex-1 min-w-0 flex flex-col p-0 overflow-hidden relative">
          
          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#FAFAF8]">
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ASSISTANT' && (
                    <div className="w-8 h-8 rounded-full bg-[#2457FF] flex items-center justify-center text-white mr-3 flex-shrink-0 mt-1 shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`px-4 py-3 rounded-2xl shadow-sm text-[14px] leading-relaxed ${
                        msg.sender === 'USER' 
                          ? 'bg-[#111318] text-white rounded-tr-sm' 
                          : 'bg-white border border-[#E5E5E0] text-[#111318] rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    
                    {renderWidget(msg)}
                    
                    <p className={`text-[10px] text-[#8E95A2] mt-1 ${msg.sender === 'USER' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Bar */}
          <div className="bg-white border-t border-[#E5E5E0] p-4">
            <div className="max-w-3xl mx-auto">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue); }}
                className="flex items-center gap-2 bg-[#F9F9F8] border border-[#E5E5E0] rounded-full p-1 pl-4 focus-within:border-[#2457FF] focus-within:ring-1 focus-within:ring-[#2457FF] transition-all shadow-sm"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about stock, expiry, transactions, or replenishment..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-[#111318]"
                />
                
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isListening 
                      ? 'bg-[#FEF2ED] text-[#C2410C] animate-pulse' 
                      : 'bg-[#EEF2FF] text-[#2457FF] hover:bg-[#D0DDFF]'
                  }`}
                  title="Voice Input"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-full bg-[#111318] text-white flex items-center justify-center hover:bg-[#2A2F3A] disabled:opacity-50 disabled:hover:bg-[#111318] transition-colors"
                  title="Send"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
              </form>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar max-w-3xl mx-auto">
                  <button onClick={() => handleSubmit("How much rice do we have?")} className="whitespace-nowrap px-3 py-1.5 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#5F6673] hover:text-[#2457FF] text-[11px] rounded-full transition-colors">"How much rice do we have?"</button>
                  <button onClick={() => handleSubmit("Which items are running low?")} className="whitespace-nowrap px-3 py-1.5 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#5F6673] hover:text-[#2457FF] text-[11px] rounded-full transition-colors">"Which items are running low?"</button>
                  <button onClick={() => handleSubmit("What expires this week?")} className="whitespace-nowrap px-3 py-1.5 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#5F6673] hover:text-[#2457FF] text-[11px] rounded-full transition-colors">"What expires this week?"</button>
                  <button onClick={() => handleSubmit("Show me today's stock movements.")} className="whitespace-nowrap px-3 py-1.5 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#5F6673] hover:text-[#2457FF] text-[11px] rounded-full transition-colors">"Show me today's stock movements"</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
