import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        let msg = data.error || 'Failed to send';
        if (data.errors && Array.isArray(data.errors)) {
          const first = data.errors.map(e => e.msg || e.param).slice(0, 3).join(', ');
          msg = first + (data.errors.length > 3 ? '...' : '');
        }
        throw new Error(msg);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>Contact</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Have questions, feedback, or a content request? Send us a quick message below or email us directly.
      </Typography>
      {submitted ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="success.main">Thank you! Your message has been received.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>You can also reach us at: paulvu@swqpz.onmicrosoft.com</Typography>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField name="name" label="Name" value={form.name} onChange={handleChange} required fullWidth />
          <TextField name="email" type="email" label="Email" value={form.email} onChange={handleChange} required fullWidth />
          <TextField name="subject" label="Subject" value={form.subject} onChange={handleChange} fullWidth />
          <TextField name="message" label="Message" value={form.message} onChange={handleChange} required fullWidth multiline minRows={4} />
          <Button variant="contained" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send'}</Button>
        </Box>
      )}
      <Box sx={{ mt: 6 }}>
        <Typography variant="caption" color="text.disabled">Direct email: paulvu@swqpz.onmicrosoft.com</Typography>
      </Box>
    </Container>
  );
};

export default Contact;
