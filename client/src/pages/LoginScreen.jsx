import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';

const LoginScreen = ({ auth, setStatus }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus?.('loading', 'Authenticating...');

        try {
            await auth.signIn(formData.username, formData.password);

            setStatus?.('success', 'Welcome back!');
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                'Login failed. Check your credentials or server connection.';
            setStatus?.('error', msg);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-black">
            <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-2xl space-y-6 animate-fade-in border border-gray-800">
                
                {/* Title */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white flex justify-center items-center gap-2">
                        <LayoutDashboard className="text-yellow-500" /> Staff Hub
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">Hotel Accountability System</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Username / Email
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white outline-none transition"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white outline-none transition"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition transform active:scale-95"
                    >
                        Sign In
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginScreen;
