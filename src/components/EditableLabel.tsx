import { useState, useRef, useEffect } from 'react';

interface EditableLabelProps {
  x: number;
  y: number;
  text: string;
  onChange: (text: string) => void;
  fontSize: number;
  fontWeight?: number;
  fill: string;
  width?: number;
}

export default function EditableLabel({
  x,
  y,
  text,
  onChange,
  fontSize,
  fontWeight = 400,
  fill,
  width = 220,
}: EditableLabelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync draft when text changes externally
  useEffect(() => {
    if (!editing) setDraft(text);
  }, [text, editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== text) {
      onChange(trimmed);
    } else {
      setDraft(text);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(text);
    setEditing(false);
  };

  const height = fontSize + 8;

  if (editing) {
    return (
      <foreignObject
        x={x - width / 2}
        y={y - height / 2 - 2}
        width={width}
        height={height + 4}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 4,
            color: fill,
            fontSize,
            fontWeight,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            textAlign: 'center',
            padding: '0 4px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </foreignObject>
    );
  }

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight={fontWeight}
      fill={fill}
      style={{ cursor: 'text' }}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <tspan>{text}</tspan>
      <title>Klicken zum Bearbeiten</title>
    </text>
  );
}
