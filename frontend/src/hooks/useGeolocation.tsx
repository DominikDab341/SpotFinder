import {useState, useEffect} from 'react';

function useGeolocation(){
    const [address, setAddress] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);                    
                    const data = await response.json();
                    setAddress(data.display_name);
                    setLoading(false);
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