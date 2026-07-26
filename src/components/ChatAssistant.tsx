import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Shield, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Welcome, Officer. I am your KaavalAI Operational Assistant. You can query me in natural language regarding crime statistics, heinous incidents, and suspects.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.response, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error communicating with the NLP engine. Please try again.", timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: "Network connection to NLP service failed.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px',
      background: '#FFFDF9', borderLeft: '1px solid #E8D4BA',
      boxShadow: '-4px 0 24px rgba(139,26,26,0.06)', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', background: 'linear-gradient(135deg, #8B1A1A, #5C1010)',
        color: '#FFF8EF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={20} color="#FFD700" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em' }}>KaavalAI AI Assistant</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Operational NLP Assistant</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#FFF8EF', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Warning Notice */}
      <div style={{
        background: '#FEF3C7', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '11px', color: '#92400E', borderBottom: '1px solid #FCD34D', fontWeight: 600
      }}>
        <Shield size={12} /> Live database query parsing active · Auditor logged
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
          }}>
            <div style={{
              background: m.sender === 'user' ? 'linear-gradient(135deg, #8B1A1A, #5C1010)' : '#FFFFFF',
              color: m.sender === 'user' ? '#FFF8EF' : '#1C0A00',
              padding: '12px 16px', borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              border: m.sender === 'user' ? 'none' : '1px solid #E8D4BA',
              fontSize: '13px', lineHeight: '1.6', fontWeight: 500,
              whiteSpace: 'pre-wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              {m.text}
            </div>
            <div style={{
              fontSize: '9px', color: '#9B7560', marginTop: '4px',
              textAlign: m.sender === 'user' ? 'right' : 'left', fontWeight: 600
            }}>
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', border: '1px solid #E8D4BA', padding: '12px 16px', borderRadius: '16px 16px 16px 2px', display: 'flex', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', background: '#8B1A1A', borderRadius: '50%', display: 'inline-block' }} className="animate-bounce" />
            <span style={{ width: '6px', height: '6px', background: '#8B1A1A', borderRadius: '50%', display: 'inline-block', animationDelay: '150ms' }} className="animate-bounce" />
            <span style={{ width: '6px', height: '6px', background: '#8B1A1A', borderRadius: '50%', display: 'inline-block', animationDelay: '300ms' }} className="animate-bounce" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button onClick={() => handleSuggestedQuery("show heinous crimes")} style={styles.chip}>Heinous Crimes</button>
        <button onClick={() => handleSuggestedQuery("what are the latest crimes")} style={styles.chip}>Latest Incidents</button>
        <button onClick={() => handleSuggestedQuery("how many cases in Bengaluru")} style={styles.chip}>Bengaluru cases</button>
        <button onClick={() => handleSuggestedQuery("how many suspects")} style={styles.chip}>Suspects count</button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{
        padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #E8D4BA',
        display: 'flex', gap: '10px', alignItems: 'center'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask KaavalAI Assistant..."
          style={{
            flex: 1, padding: '12px 14px', border: '1px solid #E8D4BA', borderRadius: '12px',
            fontSize: '13px', outline: 'none', background: '#FDFBF7', color: '#1C0A00', fontWeight: 500
          }}
        />
        <button
          type="submit"
          style={{
            width: '42px', height: '42px', borderRadius: '12px', background: '#8B1A1A',
            color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(139,26,26,0.2)'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  chip: {
    padding: '6px 12px', fontSize: '11px', fontWeight: 700,
    background: '#FFF8EF', border: '1px solid #E8D4BA', borderRadius: '20px',
    color: '#8B1A1A', cursor: 'pointer', transition: 'all 0.2s',
  }
};
