import React, { useRef, useEffect, useCallback } from 'react';

interface HighlightedInputProps {
  value: string;
  onChange: (value: string) => void;
  matchedKeywords: { word: string; color: string }[];
  placeholder?: string;
  className?: string;
}

const HighlightedInput: React.FC<HighlightedInputProps> = ({
  value,
  onChange,
  matchedKeywords,
  placeholder,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const getHighlightedHTML = useCallback((text: string) => {
    if (matchedKeywords.length === 0) return text;

    let htmlContent = text;
    const sortedMatchedKeywords = [...matchedKeywords].sort((a, b) => b.word.length - a.word.length);

    sortedMatchedKeywords.forEach(({ word, color }) => {
      const regex = new RegExp(`(${word})`, 'gi'); // Use parentheses for capturing group
      htmlContent = htmlContent.replace(regex, `<span style="background-color: ${color}; border-radius: 3px; padding: 1px 3px;">$1</span>`);
    });

    return htmlContent;
  }, [matchedKeywords]);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = getHighlightedHTML(value);
    }
  }, [value, getHighlightedHTML]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        className="absolute inset-0 w-full h-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-auto bg-transparent text-transparent caret-blue-500 z-10"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        spellCheck="false"
        wrap="soft"
      />
      <div
        ref={highlightRef}
        className="absolute inset-0 w-full h-full p-4 border border-gray-300 rounded-md pointer-events-none overflow-auto break-words"
        style={{
          whiteSpace: 'pre-wrap',
          minHeight: '48px',
          outline: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default HighlightedInput;

