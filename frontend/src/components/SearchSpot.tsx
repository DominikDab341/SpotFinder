import { useState } from 'react';
import { Spot } from './SpotCard';
import api from '../api/api';

interface SearchSpotProps {
    onSpotsFetch: (spots: Spot[]) => void;
}

function SearchSpot({ onSpotsFetch }: SearchSpotProps) {
    const [address, setAddress] = useState<string>('');
    const [type, setType] = useState<string>('all'); 
    const [radius, setRadius] = useState<number>(1500); 
    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = async () => {
        if (!address) return; 
        
        setLoading(true);
        try {
            const payload: Record<string, any> = {
                address: address,
                radius: radius
            };
            if (type !== 'all') {
                payload.type = type;
            }

            const response = await api.post('/spots/', payload);
            onSpotsFetch(response.data.places);
        } catch (error) {
            console.error('Error fetching spots:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <h2>Wyszukaj</h2>
            
            <div>
                <label>Ulica / Miejsce:</label>
                <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Np. Marszałkowska, Warszawa"
                />
            </div>

            <div>
                <label>Typ:</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="restaurant">Restauracja</option>
                    <option value="cafe">Kawiarnia</option>
                    <option value="park">Park</option>
                    <option value="gym">Siłownia</option>
                    <option value="museum">Muzeum</option>
                    <option value="all">Wszystkie</option>
                </select>
            </div>

            <div>
                <label>Odległość (w metrach):</label>
                <input 
                    type="number" 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))} 
                    step="100"
                    min="100"
                    max="50000"
                />
            </div>

            <button onClick={handleSearch} disabled={loading || !address}>
                {loading ? 'Szukanie...' : 'Szukaj'}
            </button>
        </div>
    );
}

export default SearchSpot;