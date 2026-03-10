import { useState, useEffect } from "react";
import api from "../api/api";
import { Spot } from "../components/SpotCard";

interface Reservation {
    id: number;
    spotDetails: Spot;
    reservationTime: string;
    guests: number;
    status: string;
}

function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await api.get('/reservations/');
                setReservations(response.data);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        };

        fetchReservations();
    }, []);

    const handleCancelReservation = async (id: number) => {
        try {
            await api.delete(`/reservations/${id}/`);
            setReservations(reservations.filter(reservation => reservation.id !== id));
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        }
    };

    return (
        <div>
            <h1>My Reservations</h1>
            {reservations.map(reservation => (
                <div key={reservation.id}>
                    <p>Spot: {reservation.spotDetails.displayName}</p>
                    {reservation.spotDetails.rating != null && <p>Rating: {reservation.spotDetails.rating}</p>}
                    {reservation.spotDetails.userRatingCount != null && <p>User Rating Count: {reservation.spotDetails.userRatingCount}</p>}
                    {reservation.spotDetails.priceLevel != null && <p>Price Level: {reservation.spotDetails.priceLevel}</p>}
                    <p>Reservation Time: {reservation.reservationTime}</p>
                    <p>Guests: {reservation.guests}</p>
                    <p>Status: {reservation.status}</p>
                    <button onClick={() => handleCancelReservation(reservation.id)}>Cancel</button>
                </div>
            ))}
        </div>
    );
}

export default MyReservations;