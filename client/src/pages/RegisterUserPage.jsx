import React, { useState } from "react";
import apiService from "../services/apiService";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegisterUserPage({ auth }) {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        password: "",
        role: "Staff",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await apiService.registerUser(form);
            setMessage({ type: "success", text: res.message });
            setForm({ fullName: "", username: "", password: "", role: "Staff" });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Registration failed",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-gray-900 p-6 rounded-xl border border-gray-800 text-white">

            <button
                onClick={() => navigate("/admin")}
                className="flex items-center text-gray-400 mb-4 hover:text-white"
            >
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
            </button>

            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <UserPlus className="text-blue-400" /> Register New User
            </h2>

            {message && (
                <div
                    className={`p-3 mb-3 rounded ${
                        message.type === "success"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full p-3 bg-gray-800 rounded-lg"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-3 bg-gray-800 rounded-lg"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 bg-gray-800 rounded-lg"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <select
                    name="role"
                    className="w-full p-3 bg-gray-800 rounded-lg"
                    value={form.role}
                    onChange={handleChange}
                >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                >
                    {loading ? "Registering..." : "Register User"}
                </button>
            </form>
        </div>
    );
}
