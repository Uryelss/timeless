import { useState, useEffect } from "react";
import axios from "axios";


const Chatbot = () => {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchChats();
        }
    }, [isOpen]);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/chats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChats(response.data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8000/api/chat",
                { message },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setChats([...chats, { message, is_bot: false }]);
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <>
            <button className="chat-button" onClick={() => setIsOpen(!isOpen)}>
                💬 Chat
            </button>

            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <span>Chatbot</span>
                        <button onClick={() => setIsOpen(false)} className="close-button">
                            ✖
                        </button>
                    </div>

                    <div className="chat-body">
                        {chats.map((chat, index) => (
                            <p key={index} className={chat.is_bot ? "bot-message" : "user-message"}>
                                {chat.message}
                            </p>
                        ))}
                    </div>

                    <div className="chat-footer">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage} className="send-button">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
