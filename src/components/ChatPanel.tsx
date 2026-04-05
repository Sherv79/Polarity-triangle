import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, AiPosition } from '../types';
import { baryToCartesian, stripAnalysisJson } from '../utils/triangle';

interface ChatPanelProps {
  projectId: string | null;
  projectName: string | null;
  messages: ChatMessage[];
  onMessagesChange: (projectId: string, messages: ChatMessage[]) => void;
  onAiAnalysis: (projectId: string, position: AiPosition) => void;
  onReset: (projectId: string) => void;
}

let msgId = 1;

function formatTime(d: Date): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({
  projectId,
  projectName,
  messages,
  onMessagesChange,
  onAiAnalysis,
  onReset,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !projectId || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${msgId++}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    onMessagesChange(projectId, updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          projectName,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const displayContent = stripAnalysisJson(data.content);

      const assistantMsg: ChatMessage = {
        id: `msg-${msgId++}`,
        role: 'assistant',
        content: displayContent,
        timestamp: new Date(),
      };

      const withAssistant = [...updatedMessages, { ...assistantMsg, content: data.content }];
      const displayMessages = [...updatedMessages, assistantMsg];
      // Store full content (with JSON) for API context, display stripped version
      onMessagesChange(projectId, withAssistant);

      // Check for analysis
      if (data.analysis && projectId) {
        const { entscheidungsgrundlagen: eg, zurechnung: zu, steuerbarkeit: st, intensitaet } = data.analysis;
        const pos = baryToCartesian(eg, zu, st);
        onAiAnalysis(projectId, {
          x: pos.x,
          y: pos.y,
          eg,
          zu,
          st,
          intensitaet: intensitaet || 'mittel',
        });
      }

      // Update display — use displayMessages for rendering but withAssistant was already saved
      void displayMessages; // display is handled via messages prop
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-${msgId++}`,
        role: 'assistant',
        content: 'Entschuldigung, es gab einen Fehler bei der Analyse. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
      };
      onMessagesChange(projectId, [...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, projectId, projectName, messages, isLoading, onMessagesChange, onAiAnalysis]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Render messages with stripped JSON for display
  const displayMessages = messages.map((m) =>
    m.role === 'assistant' ? { ...m, content: stripAnalysisJson(m.content) } : m
  );

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
        {projectName && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flex: 1 }}>
            — {projectName}
          </span>
        )}
        {projectId && messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Chat und KI-Einschätzung zurücksetzen?')) {
                onReset(projectId);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px 4px',
              lineHeight: 1,
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            aria-label="Neues Gespräch"
            title="Neues Gespräch"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        )}
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
        {!projectId ? (
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
            Wählen Sie ein Projekt aus, um das KI-Sparring zu starten.
          </div>
        ) : displayMessages.length === 0 ? (
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
            Beschreiben Sie das Projekt „{projectName}" und erhalten Sie eine Einschätzung, welche
            Paradoxien besonders relevant sind.
          </div>
        ) : (
          <>
            {displayMessages.map((msg) => (
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
                  {msg.content}
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
            ))}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    borderBottomLeftRadius: 2,
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <span className="loading-dot" style={{ animationDelay: '0ms' }} />
                  <span className="loading-dot" style={{ animationDelay: '150ms' }} />
                  <span className="loading-dot" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={projectId ? 'Projekt beschreiben...' : 'Zuerst ein Projekt auswählen...'}
          disabled={!projectId || isLoading}
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
            opacity: !projectId ? 0.5 : 1,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          className="btn-primary"
          onClick={send}
          disabled={!input.trim() || !projectId || isLoading}
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
