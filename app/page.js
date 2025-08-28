'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Smart Nutrition Coach. I can help you with healthy meal suggestions, food replacements, and snack recommendations based on your time of day and activities. What would you like to know?",
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('nutritionCoachMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('nutritionCoachMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span>🧠</span>
            <h2>Smart Nutrition Coach</h2>
          </div>
          <button
            onClick={() => setMessages([])}
            className={styles.clearButton}
          >
            🗑️ Clear
          </button>
        </header>

        {/* Chat Messages */}
        <div className={styles.chatContainer}>
          <div className={styles.messages}>
            {messages.length === 0 && !isLoading && (
              <div className={styles.suggestions}>
                <p>💡 Try asking me things like:</p>
                <div className={styles.suggestionChips}>
                  <button onClick={() => setInput("What’s a healthy dinner option?")}>
                    What’s a healthy dinner option?
                  </button>
                  <button onClick={() => setInput("Suggest a replacement for soda")}>
                    Suggest a replacement for soda
                  </button>
                  <button onClick={() => setInput("What snack should I eat after my workout?")}>
                    What snack should I eat after my workout?
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.role === 'user'
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className={styles.assistantMessage}>
                <span>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <footer className={styles.footer}>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about meals, replacements, snacks..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}
            >
              ➤
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}
