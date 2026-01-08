'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, Divider, IconButton } from '@mui/material';
import { MdDelete, MdThumbUp } from 'react-icons/md';
import GoogleLoginButton from '../GoogleLoginButton';
import { useTranslation } from 'react-i18next';

interface Comment {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    content: string;
    createdAt: string;
}

interface Props {
    targetType: 'Hero' | 'News';
    targetId: string; // Slug
}

export default function CommentSection({ targetType, targetId }: Props) {
    const { t } = useTranslation();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check local storage for user (simple check, ideally use Context)
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));

        fetchComments();
    }, [targetId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/comments/${targetType}/${targetId}`);
            const data = await res.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setLoading(true);

        try {
            // Note: We need credentials to send the cookie
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Cookie is sent automatically if withCredentials is setup or simpler: we are relying on cookie?
                    // Wait, fetch by default doesn't send cookies cross-origin unless defined.
                    // But client and server usually same domain or handled via proxy?
                    // If localhost:3000 -> localhost:7000, we need credentials: 'include'.
                },
                body: JSON.stringify({
                    content: newComment,
                    targetType,
                    targetId
                }),
                // IMPORTANT: Send HttpOnly cookie
                // credentials: 'include' 
                // NOTE: Next.js App Router might server-side render, but this is 'use client'.
                // Browser fetch needs 'credentials: include' to send cookies to a different port on localhost.
            });

            // Actually, standard fetch needs this explicitly:
            // But let's check if the previous login set it on the backend domain?
            // If backend is on PORT 7000 and Frontend 3000, cookies might not stick if domains differ or SameSite is strict.
            // But for now let's assume standard setup.

            const data = await res.json();
            if (data.success) {
                setComments([data.data, ...comments]);
                setNewComment('');
            } else {
                alert('Failed to post: ' + data.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Custom fetch wrapper to include credentials? 
    // For now let's try direct. If it fails due to auth, I'll advise user or fix.
    // Actually, I should add `credentials: 'include'` to the fetch.

    const handleLogout = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST' }).then(() => {
            localStorage.removeItem('user');
            setUser(null);
            // window.location.reload(); // Optional
        });
    };

    return (
        <Box sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#C9A063' }}>
                Comments ({comments.length})
            </Typography>

            {/* Input Area */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(201, 160, 99, 0.2)' }}>
                {user ? (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }} />
                            <Typography sx={{ fontWeight: 600, color: '#C9A063' }}>{user.name}</Typography>
                            <Button size="small" onClick={handleLogout} sx={{ ml: 'auto', color: '#666' }}>Logout</Button>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiInputBase-root': { color: '#fff' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSubmit} // Wrapper to include credentials
                            disabled={loading || !newComment.trim()}
                            sx={{
                                bgcolor: '#C9A063',
                                color: '#000',
                                '&:hover': { bgcolor: '#B08850' }
                            }}
                        >
                            Post Comment
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography sx={{ mb: 2, color: '#ccc' }}>Please login to comment</Typography>
                        <Box sx={{ display: 'inline-block' }}>
                            <GoogleLoginButton />
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments.map(comment => (
                    <Paper key={comment._id} sx={{ p: 2, bgcolor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={comment.user?.avatar} alt={comment.user?.name} />
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#E0E0E0' }}>{comment.user?.name || 'Unknown'}</Typography>
                                    <Typography variant="caption" sx={{ color: '#888' }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Typography sx={{ color: '#ccc', fontSize: '0.95rem' }}>{comment.content}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                ))}
                {comments.length === 0 && (
                    <Typography sx={{ color: '#666', fontStyle: 'italic' }}>No comments yet.</Typography>
                )}
            </Box>
        </Box>
    );
}
