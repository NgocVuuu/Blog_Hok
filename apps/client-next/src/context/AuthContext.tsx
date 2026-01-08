'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Using NEXT_PUBLIC_API_URL or relative path.
            // Since this runs on client, relative path '/api/auth/me' should be proxied or full URL needed?
            // Existing code uses process.env.NEXT_PUBLIC_API_URL
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

            const res = await fetch(`${apiUrl}/api/auth/me`, {
                credentials: 'include', // Send cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
            await fetch(`${apiUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUser(null);
        // Optional: window.location.reload() if strictly needed, but state update should be enough
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
