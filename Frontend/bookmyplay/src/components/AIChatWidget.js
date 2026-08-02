import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../css/AIChatWidget.css";
import {
    FaRobot,
    FaPaperPlane,
    FaTimes,
    FaCommentDots,
    FaUser
} from "react-icons/fa";

const API_URL = "http://localhost:8080/api/ai/chat";

const SUGGESTION_CHIPS = [
    { label: "🏏 Find Cricket Turf", query: "Find cricket turfs in Pune" },
    { label: "🏸 Find Badminton Court", query: "Show badminton courts under ₹700" },
    { label: "⚽ Football Grounds", query: "Recommend football venues" },
    { label: "🎾 Tennis Courts", query: "Which tennis courts are available?" },
    { label: "💰 Budget Venues", query: "Cheapest venues" },
    { label: "⭐ Top Rated Venues", query: "Show top-rated venues" },
    { label: "🎁 Offers & Coupons", query: "What coupons are active?" },
    { label: "📅 Booking Help", query: "How do I book a slot?" }
];

function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: `Hello 👋\n\nWelcome to **BookMyPlay**!\n\nI can help you:\n- Find sports venues\n- Recommend venues by city\n- Suggest sports\n- Compare prices\n- Explain bookings\n- Help with coupons\n- Answer FAQs`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (queryText) => {
        const text = queryText || inputValue;
        if (!text.trim()) return;

        // User message
        const userMsg = {
            sender: "user",
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await axios.post(API_URL, { message: text });
            const replyText = response.data?.reply || "I'm sorry, I encountered an issue processing your request.";
            
            const aiMsg = {
                sender: "ai",
                text: replyText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            const errorMsg = {
                sender: "ai",
                text: "I'm having trouble connecting to my brain right now. Please ensure the backend is running and try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !isLoading) {
            handleSendMessage();
        }
    };

    // Safe inline Markdown parser
    const parseInlineMarkdown = (text) => {
        const parts = [];
        let currentIdx = 0;
        const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const matchStr = match[0];
            const matchIndex = match.index;

            if (matchIndex > currentIdx) {
                parts.push(text.substring(currentIdx, matchIndex));
            }

            if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
                parts.push(<strong key={`b-${matchIndex}`}>{matchStr.slice(2, -2)}</strong>);
            } else {
                const linkRegex = /\[(.*?)\]\((.*?)\)/;
                const linkMatch = matchStr.match(linkRegex);
                if (linkMatch) {
                    parts.push(
                        <a
                            key={`a-${matchIndex}`}
                            href={linkMatch[2]}
                            style={{ color: "#198754", fontWeight: "600", textDecoration: "underline" }}
                        >
                            {linkMatch[1]}
                        </a>
                    );
                } else {
                    parts.push(matchStr);
                }
            }
            currentIdx = regex.lastIndex;
        }

        if (currentIdx < text.length) {
            parts.push(text.substring(currentIdx));
        }

        return parts.length > 0 ? parts : text;
    };

    const renderMarkdown = (text) => {
        if (!text) return "";
        const lines = text.split("\n");
        const elements = [];
        let listItems = [];

        lines.forEach((line, idx) => {
            const content = line.trim();

            if (content.startsWith("- ") || content.startsWith("* ")) {
                listItems.push(
                    <li key={`li-${idx}-${listItems.length}`}>
                        {parseInlineMarkdown(content.substring(2))}
                    </li>
                );
            } else {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`ul-${idx}`} className="mb-2 ps-3" style={{ listStyleType: "disc" }}>
                            {listItems}
                        </ul>
                    );
                    listItems = [];
                }

                const numMatch = content.match(/^(\d+)\.\s+(.*)$/);
                if (numMatch) {
                    elements.push(
                        <div key={`ol-${idx}`} className="mb-2 ps-3" style={{ textIndent: "-15px", paddingLeft: "15px" }}>
                            <strong>{numMatch[1]}. </strong>
                            {parseInlineMarkdown(numMatch[2])}
                        </div>
                    );
                } else if (content === "") {
                    elements.push(<div key={`br-${idx}`} style={{ height: "6px" }} />);
                } else {
                    elements.push(
                        <p key={`p-${idx}`} className="mb-2">
                            {parseInlineMarkdown(content)}
                        </p>
                    );
                }
            }
        });

        if (listItems.length > 0) {
            elements.push(
                <ul key="ul-final" className="mb-2 ps-3" style={{ listStyleType: "disc" }}>
                    {listItems}
                </ul>
            );
        }

        return elements;
    };

    return (
        <div className="ai-chat-container">
            {/* Floating Chat Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="ai-chat-btn"
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? <FaTimes /> : <FaCommentDots />}
                <span className="ai-chat-btn-tooltip">Ask BookMyPlay AI</span>
            </button>

            {/* Chat Panel Window */}
            <div className={`ai-chat-window ${isOpen ? "open" : ""}`}>
                {/* Header */}
                <div className="ai-chat-header">
                    <div className="ai-chat-header-info">
                        <h5 className="ai-chat-header-title">
                            🤖 BookMyPlay AI
                        </h5>
                        <p className="ai-chat-header-subtitle">
                            Your Smart Sports Booking Assistant
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="ai-chat-header-close"
                        aria-label="Close chat window"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="ai-chat-body">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`ai-chat-msg-row ${msg.sender === "user" ? "user" : "ai"}`}
                        >
                            <div className="ai-chat-avatar">
                                {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                            </div>
                            <div className="ai-chat-bubble-container">
                                <div className="ai-chat-bubble">
                                    {renderMarkdown(msg.text)}
                                </div>
                                <span className="ai-chat-timestamp">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}

                    {/* Typing Animation */}
                    {isLoading && (
                        <div className="ai-chat-msg-row ai">
                            <div className="ai-chat-avatar">
                                <FaRobot />
                            </div>
                            <div className="ai-chat-bubble-container">
                                <div className="ai-chat-bubble">
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion Chips */}
                <div className="ai-chat-chips-container">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(chip.query)}
                            disabled={isLoading}
                            className="ai-chat-chip"
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* Footer Input Area */}
                <div className="ai-chat-input-area">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask anything about BookMyPlay..."
                        className="ai-chat-input"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                        className="ai-chat-send-btn"
                        aria-label="Send message"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AIChatWidget;
