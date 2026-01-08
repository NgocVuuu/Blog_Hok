'use client';
import { useEffect, useState } from 'react';

export default function CommentDate({ dateString }: { dateString: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // or return a server-safe consistent date/placeholder
    }

    return (
        <span>{new Date(dateString).toLocaleDateString()}</span>
    );
}
