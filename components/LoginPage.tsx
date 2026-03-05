
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RobotIcon } from './Icons';

const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login(password);
    };

    return (
        <div className="min-h-screen flex flex-col p-4">
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-sm animate-fade-in-slide-up">
                    <div className="glass-pane rounded-2xl shadow-2xl p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-4 shadow-lg" style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>
                               <RobotIcon className="w-16 h-16 text-white" />
                            </div>
                        </div>
                         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
                           Bubinger-AI
                        </h1>
                        <p className="text-slate-400 mb-6">
                            Bitte geben Sie Ihr Passwort ein.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-300 sr-only"
                                >
                                    Passwort
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Passwort"
                                    className="w-full bg-black/20 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all text-center"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? 'Anmelden...' : 'Anmelden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <footer className="flex-shrink-0 py-4 text-center text-sm text-slate-400">
                Entwickelt von ch.8uechner
            </footer>
        </div>
    );
};

export default LoginPage;