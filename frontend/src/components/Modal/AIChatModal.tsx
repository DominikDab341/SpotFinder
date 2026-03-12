import Modal from "./Modal";
import { useState } from "react";
import api from "../../api/api";


function AIChatModal({isOpen, onClose, googlePlaceId}: {isOpen: boolean, onClose: () => void, googlePlaceId: string}) {

    const [message, setMessage] = useState<string>('');
    const [chatResponse, setChatResponse] = useState<string>('');

    const handleSendMessage = async () => {
        try {
            const response = await api.post('/chat/', {
                google_place_id: googlePlaceId,
                user_question: message
            });
            setChatResponse(response.data.answer);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1>AI Chat Modal</h1>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Send</button>
            <p>{chatResponse}</p>
        </Modal>
    );
}

export default AIChatModal;