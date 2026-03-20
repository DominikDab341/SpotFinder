import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function RegisterForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords are not the same!");
            return;
        }

        const { confirm_password, ...dataToSend } = formData;

        try {
            await api.post("/register/", dataToSend);

            alert("Registration successful");
            navigate("/login");
        } catch (error) {
            console.error(error);
            alert("Registration failed. Please check your data.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
            />
            <label htmlFor="first_name">First Name</label>
            <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
            />
            <label htmlFor="last_name">Last Name</label>
            <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
            />
            <label htmlFor="email">Email</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <label htmlFor="password">Password</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
            />
            <button type="submit">Register</button>
        </form>
    );
}