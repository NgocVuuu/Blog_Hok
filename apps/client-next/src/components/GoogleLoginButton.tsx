'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { Avatar, Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginButton() {
    const { user, login, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/api/auth/google`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken: response.credential }),
                    credentials: 'include'
                });

                const data = await res.json();
                if (data.success) {
                    // Update context directly
                    login(data.user);
                    // No need to reload or set localStorage manually
                } else {
                    console.error('Login failed:', data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        setAnchorEl(null);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (user) {
        return (
            <Box>
                <Button onClick={handleMenu} color="inherit">
                    <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32, mr: 1 }} />
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user.name}
                    </Typography>
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem disabled>{user.email}</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Box>
        );
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                console.log('Login Failed');
            }}
            type="icon"
            theme="filled_black"
            shape="circle"
            size="large"
        />
    );
}
