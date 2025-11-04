const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE === 'true') || false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
  }
  return transporter;
}

exports.sendContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errPayload = errors.array().map(e => ({ param: e.param, msg: e.msg, value: e.value }));
    logger.warn('Contact validation failed', { errors: errPayload });
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errPayload.map(e => ({ param: e.param, msg: e.msg }))
    });
  }

  const { name, email, subject, message } = req.body;
  try {
    const to = process.env.CONTACT_TO || process.env.SMTP_USER;
    if (!to) {
      logger.error('Contact recipient not configured');
      return res.status(500).json({ success: false, error: 'Contact recipient not configured' });
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@bloghok',
      to,
      subject: `[Contact] ${subject || 'No subject'} - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
      replyTo: email
    };

  await getTransporter().sendMail(mailOptions);
  logger.info('Contact message sent', { from: email, subject: subject || 'No subject' });
  res.json({ success: true, message: 'Message sent' });
  } catch (err) {
  logger.error('Contact send error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
