import Modal from "./Modal";
import { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import '../../css/aiChatModal.css';

type Message = { role: 'user' | 'ai'; text: string };

function AIChatModal({isOpen, onClose, googlePlaceId}: {isOpen: boolean, onClose: () => void, googlePlaceId: string}) {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setMessages([]);
            setMessage('');
            setLoading(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading, isOpen]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMsg = message.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('/chat/', {
                google_place_id: googlePlaceId,
                user_question: userMsg
            });
            setMessages(prev => [...prev, { role: 'ai', text: response.data.answer }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: "Spróbuj ponownie lub napisz w innej formie. Zbyt mało danych, by AI odpowiedziało dokładnie." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const parseMarkdown = (text: string) => {
        const textWithBullets = text.replace(/(^|\s)[\*\-]\s/g, '\n• ');
        
        const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="chat-bold-text">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1 className="modal-title">Ask AI about this Spot</h1>
            
            <div className="chat-history">
                {messages.length === 0 && !loading && (
                    <p className="chat-empty-msg">Ask any question to get AI insights about this location!</p>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                        {msg.role === 'ai' ? parseMarkdown(msg.text) : msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="chat-loading">
                        AI is typing<span className="chat-loading-dots"></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
                <input 
                    className="chat-input" 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Is there parking available?"
                    disabled={loading}
                />
                <button 
                    className="chat-btn chat-btn-primary" 
                    onClick={handleSendMessage}
                    disabled={loading || !message.trim()}
                >
                    Send
                </button>
            </div>
        </Modal>
    );
}

export default AIChatModal;