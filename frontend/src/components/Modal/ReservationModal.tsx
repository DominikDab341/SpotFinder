import { useState } from 'react';
import Modal from './Modal';
import api from '../../api/api';
import '../../css/reservationModal.css';

import { Spot } from '../SpotCard';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    place: Spot;
}

function ReservationModal({ isOpen, onClose, place }: Props) {
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [guests, setGuests] = useState<number>(1);

    const handleReservation = async () => {
        if (!date || !time) {
            alert("Please provide the date and time.");
            return;
        }

        try {
            const combinedDateTime = new Date(`${date}T${time}`).toISOString();

            await api.post('/reservations/', {
                reservationTime: combinedDateTime,
                guests: guests,

                googlePlaceId: place.googlePlaceId,
                displayName: place.displayName,
                formattedAddress: place.formattedAddress,
                rating: place.rating || null,
                userRatingCount: place.userRatingCount || null,
                priceLevel: place.priceLevel || null,
                spotCategory: place.spotCategory
            });
            onClose();
        } catch (error) {
            console.log("Reservation error:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1 className="modal-title">Reservation - {place.displayName}</h1>
            
            <div className="reservation-form-group">
                <label>Date:</label>
                <input className="reservation-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            
            <div className="reservation-form-group">
                <label>Time:</label>
                <input className="reservation-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            
            <div className="reservation-form-group">
                <label>Guests:</label>
                <input className="reservation-input" type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </div>
            
            <div className="reservation-actions">
                <button className="reservation-btn reservation-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="reservation-btn reservation-btn-primary" onClick={handleReservation}>Reserve</button>
            </div>
        </Modal>
    );
}

export default ReservationModal;
