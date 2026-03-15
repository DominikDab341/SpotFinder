import { useState, useEffect } from 'react';
import { Spot } from './SpotCard';
import api from '../api/api';

interface SpotCategory {
    key: string;
    label: string;
}

interface SearchSpotProps {
    onSpotsFetch: (spots: Spot[]) => void;
}

function SearchSpot({ onSpotsFetch }: SearchSpotProps) {
    const [address, setAddress] = useState<string>('');
    const [type, setType] = useState<string>('all');
    const [radius, setRadius] = useState<number>(1500);
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<SpotCategory[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/spot-types/');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching spot categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = async () => {
        if (!address) return;

        setLoading(true);
        try {
            const payload: Record<string, any> = {
                address: address,
                radius: radius
            };
            if (type !== 'all') {
                payload.spot_type = type;
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
            <h2>Search</h2>

            <div>
                <label>Address / Place:</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Times Square, New York"
                />
            </div>

            <div>
                <label>Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="all">All</option>
                    {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label>Distance (meters):</label>
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
                {loading ? 'Searching...' : 'Search'}
            </button>
        </div>
    );
}

export default SearchSpot;