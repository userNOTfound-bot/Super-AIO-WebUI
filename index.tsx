import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { GoogleGenAI, Chat } from "@google/genai";

// A simple markdown to HTML converter
const markdownToHtml = (text: string): string => {
  let html = text
    .replace(/```([\s\S]*?)```/g, (_match, code) => `<pre><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/(\n|^)- (.*)/g, '$1<ul><li>$2</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '\n');

  return html.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
};

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
);

const GeminiIcon = () => (
    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
);

const AttachmentIcon = () => (
    <svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path></svg>
);

const MenuIcon = () => (
    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
);

const WelcomeRobotIcon = () => (
    <svg className="welcome-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8v4Z"/>
        <path d="M16 8V4h-4v4Z"/>
        <path d="M12 18h.01"/>
        <path d="M16 14h.01"/>
        <path d="M8 14h.01"/>
        <path d="M18 12h2"/>
        <path d="M4 12h2"/>
        <rect x="4" y="10" width="16" height="10" rx="2"/>
        <path d="M7 10v-2a5 5 0 0 1 5-5v0a5 5 0 0 1 5 2v2"/>
    </svg>
);

const AIPlatformIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8v4Z"/><path d="M16 8V4h-4v4Z"/><path d="M12 20h.01"/><path d="M16 16h.01"/><path d="M8 16h.01"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M6 12v-2a6 6 0 1 1 12 0v2"/></svg>
);

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const VideoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect></svg>
);

const SongIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
);

const BuildIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

const DropdownIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg className={`dropdown-icon ${!isOpen ? 'collapsed' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const HistoryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v5h5" />
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
        <path d="M12 7v5l3 3" />
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SunIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const ThemeToggle = ({ theme, onToggle }: { theme: string, onToggle: () => void }) => (
    <button className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  onThemeToggle: () => void;
}

const SettingsModal = ({ isOpen, onClose, theme, onThemeToggle }: SettingsModalProps) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <nav className="modal-nav">
            <a href="#" className="modal-nav-item active" onClick={(e) => e.preventDefault()}>General</a>
          </nav>
          <main className="modal-main">
            <h3>General Settings</h3>
            <div className="setting-item">
              <div className="setting-item-label">
                <h4>Theme</h4>
                <p>Customize the look and feel of the application.</p>
              </div>
              <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

interface Message {
  sender: 'user' | 'model';
  content: string;
}

interface FileObject {
  name: string;
  type: string;
  data: string; // base64 encoded string
}

const WelcomeScreen = ({ onGetStarted, theme, onThemeToggle }: { onGetStarted: () => void; theme: string; onThemeToggle: () => void; }) => (
    <div className="welcome-container">
        <div className="welcome-theme-toggle-wrapper">
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
        <main className="welcome-content">
            <WelcomeRobotIcon />
            <h1 className="welcome-title">Welcome to Super AIO</h1>
            <p className="welcome-subtitle">
                Your All-in-One AI Assistant. Chat, create, build, and learn with a powerful suite of AI tools at your fingertips.
            </p>
            <button className="welcome-button" onClick={onGetStarted}>
                Get Started
            </button>
        </main>
    </div>
);


const App = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [activeMenuItem, setActiveMenuItem] = useState('Chat');
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
      });
      setChat(chatInstance);
    } catch (error) {
      console.error("Failed to initialize Gemini:", error);
      setMessages([{ sender: 'model', content: "Error: Could not initialize the AI model. Please check the API key." }]);
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach(file => {
        if (files.some(f => f.name === file.name)) return; // Avoid duplicates
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64 = (loadEvent.target?.result as string)?.split(',')[1];
          if (base64) {
            setFiles(prev => [...prev, { name: file.name, type: file.type || 'application/octet-stream', data: base64 }]);
          }
        };
        reader.onerror = (error) => console.error("FileReader error:", error);
        reader.readAsDataURL(file);
      });
      e.target.value = ''; // Allow selecting the same file again
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };


  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || isLoading || !chat) return;

    const fileContentRepresentation = files.map(f => `[file: ${f.name}]`).join(' ');
    const fullPrompt = `${input} ${fileContentRepresentation}`.trim();
    const userMessage: Message = { sender: 'user', content: fullPrompt };
    setMessages(prev => [...prev, userMessage]);

    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.type,
        data: file.data,
      },
    }));
    
    const messagePayload = [input.trim(), ...fileParts];

    setInput('');
    setFiles([]);
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: messagePayload });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { sender: 'model', content: '...' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = modelResponse;
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === 'model') {
            newMessages[newMessages.length - 1].content = errorMessage;
        } else {
            newMessages.push({ sender: 'model', content: errorMessage });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  if (!hasStarted) {
    return <WelcomeScreen onGetStarted={() => setHasStarted(true)} theme={theme} onThemeToggle={handleThemeToggle} />;
  }

  return (
    <div className="app-container">
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <aside className={`sidebar left-sidebar ${!isLeftSidebarOpen ? 'minimized' : ''}`}>
        <div className="sidebar-content">
            <div className="sidebar-main-content">
                <div className="sidebar-header">
                  <div className="sidebar-title">
                      <AIPlatformIcon />
                      <span>Super AIO</span>
                  </div>
                  <button 
                      className="sidebar-toggle" 
                      onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                      aria-label={isLeftSidebarOpen ? 'Close left sidebar' : 'Open left sidebar'}>
                      <MenuIcon />
                  </button>
                </div>
                
                <nav className="sidebar-menu">
                    <div className="sidebar-menu-category" onClick={() => setIsBasicOpen(!isBasicOpen)}>
                        <h3>Basic</h3>
                        <DropdownIcon isOpen={isBasicOpen} />
                    </div>
                    {isBasicOpen && (
                        <div 
                            className={`sidebar-menu-item ${activeMenuItem === 'Chat' ? 'active' : ''}`}
                            onClick={() => setActiveMenuItem('Chat')}
                        >
                            <ChatIcon />
                            <span>Chat</span>
                        </div>
                    )}

                    <div className="sidebar-menu-category" onClick={() => setIsAdvanceOpen(!isAdvanceOpen)}>
                        <h3>Advance</h3>
                        <DropdownIcon isOpen={isAdvanceOpen} />
                    </div>
                    {isAdvanceOpen && (
                        <>
                            <div 
                                className={`sidebar-menu-item ${activeMenuItem === 'Image' ? 'active' : ''}`}
                                onClick={() => setActiveMenuItem('Image')}
                            >
                                <ImageIcon />
                                <span>Image</span>
                            </div>
                            <div 
                                className={`sidebar-menu-item ${activeMenuItem === 'Video' ? 'active' : ''}`}
                                onClick={() => setActiveMenuItem('Video')}
                            >
                                <VideoIcon />
                                <span>Video</span>
                            </div>
                            <div 
                                className={`sidebar-menu-item ${activeMenuItem === 'Song' ? 'active' : ''}`}
                                onClick={() => setActiveMenuItem('Song')}
                            >
                                <SongIcon />
                                <span>Song</span>
                            </div>
                            <div 
                                className={`sidebar-menu-item ${activeMenuItem === 'Build' ? 'active' : ''}`}
                                onClick={() => setActiveMenuItem('Build')}
                            >
                                <BuildIcon />
                                <span>Build</span>
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-footer-item">
            <HistoryIcon />
            <span>History</span>
          </div>
          <div className="sidebar-footer-item" onClick={() => setIsSettingsModalOpen(true)}>
            <SettingsIcon />
            <span>Settings</span>
          </div>
          <div className="sidebar-footer-item">
            <UserIcon />
            <span>User</span>
          </div>
        </div>
      </aside>
      
      <main className="chat-wrapper">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'user' ? <UserIcon /> : <GeminiIcon />}
                </div>
                <div className="message-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}></div>
              </div>
            ))}
            {isLoading && (!messages.length || messages[messages.length - 1]?.sender === 'user') && (
                 <div className="message model">
                    <div className="message-avatar"><GeminiIcon /></div>
                    <div className="message-content">...</div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            {files.length > 0 && (
              <div className="file-preview-area">
                {files.map(file => (
                  <div key={file.name} className="file-pill">
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(file.name)} title={`Remove ${file.name}`}>&times;</button>
                  </div>
                ))}
              </div>
            )}
            <div className="chat-input-form">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple style={{ display: 'none' }} accept="*/*" />
              <button className="attachment-button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="Attach files">
                <AttachmentIcon />
              </button>
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Gemini..."
                rows={1}
                disabled={isLoading}
              />
              <button className="send-button" onClick={handleSend} disabled={isLoading || (!input.trim() && files.length === 0)}>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);