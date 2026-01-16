import React, { useState } from 'react';
import { Modal } from './Modal';
import { Lock } from 'lucide-react';

interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === "911") {
            onLogin();
            onClose();
            setPasscode("");
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Admin Access">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Passcode</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="password"
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter passcode"
                            value={passcode}
                            onChange={(e) => {
                                setPasscode(e.target.value);
                                setError(false);
                            }}
                            autoFocus
                        />
                    </div>
                    {error && <span className="text-xs text-red-500 font-medium">Incorrect passcode</span>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-all"
                >
                    Login
                </button>
            </form>
        </Modal>
    );
}
