import { useState } from 'react';
import Modal from './Modal';
import api from '../../api/api';

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
            alert("Proszę podać datę i godzinę.");
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
                priceLevel: place.priceLevel || null
            });
            onClose();
        } catch (error) {
            console.log("Reservation error:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h1>Rejestracja - {place.displayName}</h1>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            <input type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleReservation}>Reserve</button>
        </Modal>
    );
}

export default ReservationModal;
