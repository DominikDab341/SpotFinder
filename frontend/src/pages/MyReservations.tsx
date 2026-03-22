import { useState, useEffect } from "react";
import api from "../api/api";
import { Spot } from "../components/SpotCard";
import '../css/home.css';
import '../css/spotCard.css';

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
        <div className="home-container">
            <h1 className="home-header">My Reservations</h1>
            
            <div className="spot-grid">
                {reservations.map(reservation => (
                    <div key={reservation.id} className="spot-card">
                        <h2 className="spot-title">{reservation.spotDetails.displayName}</h2>
                        
                        {reservation.spotDetails.rating != null && (
                            <p className="spot-detail"><strong>Rating:</strong> {reservation.spotDetails.rating}</p>
                        )}
                        {reservation.spotDetails.userRatingCount != null && (
                            <p className="spot-detail"><strong>User Rating Count:</strong> {reservation.spotDetails.userRatingCount}</p>
                        )}
                        {reservation.spotDetails.priceLevel != null && (
                            <p className="spot-detail"><strong>Price Level:</strong> {reservation.spotDetails.priceLevel}</p>
                        )}
                        
                        <p className="spot-detail">
                            <strong>Reservation Time:</strong> {new Date(reservation.reservationTime).toLocaleString()}
                        </p>
                        <p className="spot-detail"><strong>Guests:</strong> {reservation.guests}</p>
                        <p className="spot-detail"><strong>Status:</strong> {reservation.status}</p>
                        
                        <div className="spot-actions">
                            <button className="spot-btn spot-btn-primary" onClick={() => handleCancelReservation(reservation.id)}>
                                Cancel Reservation
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyReservations;