import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('token/', {
                username,
                password,
            });
            localStorage.setItem('accessToken', response.data.access);

            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="login-error-msg">{error}</p>}

            <div className="login-input-group">
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="login-input-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className="login-submit-btn">
                Log In
            </button>
        </form>
    );
};

export default LoginForm;