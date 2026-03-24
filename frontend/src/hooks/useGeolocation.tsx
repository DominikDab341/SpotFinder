import {useState, useEffect} from 'react';

function useGeolocation(){
    const [address, setAddress] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);                    
                        if (!response.ok) {
                            throw new Error("Error while fetching address (Nominatim API).");
                        }
                        const data = await response.json();
                        setAddress(data.display_name);
                        setLoading(false);
                    } catch (error: any) {
                        setError(error.message || "An unknown error occurred.");
                        setLoading(false);
                    }
                },
                (error) => {
                    setError(error.message);
                    setLoading(false);
                }
            )
        }
        else{
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    }, []);

    return {address, error, loading};
}

export default useGeolocation;