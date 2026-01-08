'use client';

import React, { useState } from 'react';
import { Box, Typography, Avatar, Button, IconButton, Paper, TextField, Collapse } from '@mui/material';
import { MdThumbUp, MdThumbUpOffAlt, MdReply } from 'react-icons/md';
import CommentDate from './CommentDate';
import { useAuth } from '@/context/AuthContext';

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

interface CommentItemProps {
    comment: Comment;
    replies: Comment[];
    allComments: Comment[]; // Needed for deep nesting if specific logic requires, or just pass filtered replies
    depth?: number;
    onReply: (parentId: string, content: string) => Promise<void>;
    onLike: (commentId: string) => Promise<void>;
}

export default function CommentItem({ comment, replies, allComments, depth = 0, onReply, onLike }: CommentItemProps) {
    const { user } = useAuth();
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isLiked = user ? comment.likes.includes(user._id) : false;

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        await onReply(comment._id, replyContent);
        setSubmitting(false);
        setReplyContent('');
        setShowReplyBox(false);
    };

    // Find replies to this comment's replies (if we want infinite nesting)
    // Actually, the parent passes *direct* replies. logic:
    // We render this comment.
    // Then we render `replies` (which are children).
    // The `replies` need their own replies.
    // So we need to helper function to find replies from `allComments` for each child? 
    // OR `replies` prop is already the children.
    // Ideally, the Parent (CommentSection) builds a Tree, OR we filter `allComments` here.
    // Let's filter `allComments` here to handle infinite recursion simply.

    // BUT `CommentSection` passed `replies` specifically for *this* comment.
    // Wait, for the *children* of *this* comment (the `replies` array), we need to find *their* children.
    // So we need `allComments` available to pass down.

    const getReplies = (parentId: string) => {
        return allComments.filter(c => c.parentId === parentId);
    };

    return (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                ml: depth * 4, // Indent replies
                bgcolor: depth > 0 ? 'background.default' : 'background.paper',
                borderRadius: 2,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: depth > 0 ? '4px solid' : '1px solid',
                borderLeftColor: depth > 0 ? 'primary.main' : 'divider'
            }}
        >
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={comment.user?.avatar} alt={comment.user?.name} sx={{ width: 32, height: 32 }} />
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                            {comment.user?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            <CommentDate dateString={comment.createdAt} />
                        </Typography>
                    </Box>

                    <Typography sx={{ color: 'text.primary', fontSize: '0.95rem', mb: 1, whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                    </Typography>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            size="small"
                            startIcon={isLiked ? <MdThumbUp /> : <MdThumbUpOffAlt />}
                            onClick={() => onLike(comment._id)}
                            sx={{ color: isLiked ? 'primary.main' : 'text.secondary', minWidth: 'auto', p: 0.5 }}
                        >
                            {comment.likes.length > 0 ? comment.likes.length : 'Like'}
                        </Button>

                        <Button
                            size="small"
                            startIcon={<MdReply />}
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            sx={{ color: 'text.secondary', minWidth: 'auto', p: 0.5 }}
                        >
                            Reply
                        </Button>
                    </Box>

                    {/* Reply Input */}
                    <Collapse in={showReplyBox}>
                        <Box sx={{ mt: 2, pl: 0 }}>
                            {user ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder={`Reply to ${comment.user?.name}...`}
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { bgcolor: 'background.default' }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleReplySubmit}
                                        disabled={submitting || !replyContent.trim()}
                                        sx={{ minWidth: 80 }}
                                    >
                                        Reply
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Please login to reply including
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Box>

            {/* Render Replies Recursively */}
            {replies.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    {replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            replies={getReplies(reply._id)}
                            allComments={allComments}
                            depth={depth + 1}
                            onReply={onReply}
                            onLike={onLike}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
}
