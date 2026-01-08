'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper } from '@mui/material';
import GoogleLoginButton from '../GoogleLoginButton';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import CommentItem from './CommentItem';

interface Comment {
    _id: string;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    content: string;
    createdAt: string;
    likes: string[];
    parentId: string | null;
}

interface Props {
    targetType: 'Hero' | 'News';
    targetId: string; // Slug
}

export default function CommentSection({ targetType, targetId }: Props) {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
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

    const handleRootSubmit = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    targetType,
                    targetId,
                    parentId: null
                }),
            });

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
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    targetType,
                    targetId,
                    parentId
                }),
            });

            const data = await res.json();
            if (data.success) {
                // Add new reply to local state
                setComments([data.data, ...comments]);
            } else {
                alert('Failed to reply: ' + data.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLike = async (commentId: string) => {
        if (!user) {
            alert('Please login to like comments');
            return;
        }

        // Optimistic update
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const alreadyLiked = c.likes.includes(user._id);
                return {
                    ...c,
                    likes: alreadyLiked
                        ? c.likes.filter(id => id !== user._id)
                        : [...c.likes, user._id]
                };
            }
            return c;
        }));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/comments/${commentId}/like`, {
                method: 'PUT',
                credentials: 'include',
            });

            const data = await res.json();
            if (!data.success) {
                // Revert if failed (fetch again to be safe)
                fetchComments();
            }
        } catch (e) {
            console.error(e);
            fetchComments();
        }
    };

    // Filter root comments
    const rootComments = comments.filter(c => !c.parentId);

    return (
        <Box sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#C9A063' }}>
                Comments ({comments.length})
            </Typography>

            {/* Input Area (New Root Comment) */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                {user ? (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={user.avatar} alt={user.name} sx={{ mr: 2 }} />
                            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{user.name}</Typography>
                            <Button size="small" onClick={logout} sx={{ ml: 'auto', color: 'text.secondary' }}>Logout</Button>
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
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(201, 160, 99, 0.5)' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleRootSubmit}
                            disabled={submitting || !newComment.trim()}
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
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>Please login to comment</Typography>
                        <Box sx={{ display: 'inline-block' }}>
                            <GoogleLoginButton />
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* List */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {rootComments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        replies={comments.filter(c => c.parentId === comment._id)}
                        allComments={comments}
                        onReply={handleReply}
                        onLike={handleLike}
                    />
                ))}
                {comments.length === 0 && (
                    <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No comments yet.</Typography>
                )}
            </Box>
        </Box>
    );
}
