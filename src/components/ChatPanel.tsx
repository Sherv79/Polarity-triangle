import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';

let msgId = 1;

const BOT_REPLY =
  'KI-Analyse wird in einer zukünftigen Version verfügbar sein. Dieses Panel wird dann Ihr Projekt analysieren und eine Einschätzung der Paradoxie-Intensität geben.';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${msgId++}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate bot reply after 1s
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${msgId++}`,
        role: 'bot',
        text: BOT_REPLY,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          KI-Sparring
        </span>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        style={{
          height: 300,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 6,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'background-color 150ms ease',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 12,
              textAlign: 'center',
              lineHeight: 1.5,
              padding: '0 16px',
            }}
          >
            Beschreiben Sie ein KI-Projekt und erhalten Sie eine Einschätzung, welche Paradoxien
            besonders relevant sind.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  ...(msg.role === 'user'
                    ? {
                        backgroundColor: 'var(--accent-primary)',
                        color: '#FFFFFF',
                        borderBottomRightRadius: 2,
                      }
                    : {
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        borderBottomLeftRadius: 2,
                      }),
                }}
              >
                {msg.text}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  marginTop: 2,
                  paddingInline: 4,
                }}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Projekt beschreiben..."
          rows={2}
          style={{
            flex: 1,
            resize: 'vertical',
            minHeight: 40,
            maxHeight: 120,
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 150ms ease',
            lineHeight: 1.4,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          className="btn-primary"
          onClick={send}
          disabled={!input.trim()}
          style={{ padding: '8px 10px', lineHeight: 1, flexShrink: 0 }}
          aria-label="Senden"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
