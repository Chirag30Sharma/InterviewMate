const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../schemas/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// HTML Email Templates
const getVerificationEmailTemplate = (name, verificationLink) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - InterviewMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding: 40px 20px; text-align: center; background: linear-gradient(45deg, #1a237e 30%, #0d47a1 90%); border-radius: 8px 8px 0 0;">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/job-interview-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--meeting-business-pack-illustrations-3846823.png?f=webp" alt="InterviewMate Logo" style="max-width: 200px; height: auto;">
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 30px;">
                    <h2 style="color: #1a237e; margin: 0 0 20px 0;">Welcome to InterviewMate!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">Hello ${name},</p>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">Thank you for registering with InterviewMate. To start your interview preparation journey, please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background: linear-gradient(45deg, #1a237e 30%, #0d47a1 90%);
                                  color: white;
                                  padding: 15px 30px;
                                  text-decoration: none;
                                  border-radius: 50px;
                                  display: inline-block;
                                  font-weight: bold;
                                  font-size: 16px;
                                  transition: all 0.3s ease;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #666666; font-size: 14px; line-height: 24px; margin: 30px 0 10px 0;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; word-break: break-all;">
                        <a href="${verificationLink}" style="color: #1a237e; text-decoration: none;">${verificationLink}</a>
                    </p>
                    <p style="color: #666666; font-size: 14px; line-height: 24px; margin: 30px 0 0 0;">This link will expire in 24 hours for security reasons.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">Best regards,<br>The InterviewMate Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">
                            If you didn't create an account with InterviewMate, please ignore this email.
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

const getPasswordResetEmailTemplate = (resetLink) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - InterviewMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding: 40px 20px; text-align: center; background: linear-gradient(45deg, #1a237e 30%, #0d47a1 90%); border-radius: 8px 8px 0 0;">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/job-interview-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--meeting-business-pack-illustrations-3846823.png?f=webp" alt="InterviewMate Logo" style="max-width: 200px; height: auto;">
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 30px;">
                    <h2 style="color: #1a237e; margin: 0 0 20px 0;">Password Reset Request</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">Hello,</p>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">We received a request to reset your InterviewMate account password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background: linear-gradient(45deg, #1a237e 30%, #0d47a1 90%);
                                  color: white;
                                  padding: 15px 30px;
                                  text-decoration: none;
                                  border-radius: 50px;
                                  display: inline-block;
                                  font-weight: bold;
                                  font-size: 16px;
                                  transition: all 0.3s ease;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666666; font-size: 14px; line-height: 24px; margin: 30px 0 10px 0;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; word-break: break-all;">
                        <a href="${resetLink}" style="color: #1a237e; text-decoration: none;">${resetLink}</a>
                    </p>
                    <p style="color: #666666; font-size: 14px; line-height: 24px; margin: 30px 0 0 0;">This link will expire in 1 hour for security reasons.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                    <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">Best regards,<br>The InterviewMate Team</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">
                            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

// Registration endpoint
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password and create verification token
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken
        });

        await newUser.save();

        // Generate verification link
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        
        // Send verification email
        const mailOptions = {
            from: {
                name: 'InterviewMate',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Verify Your Email - InterviewMate',
            html: getVerificationEmailTemplate(name, verificationLink)
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            message: 'Registration successful. Please check your email to verify your account.' 
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
    }
});

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            verificationToken: req.params.token,
            isVerified: false
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ error: 'An error occurred during verification. Please try again.' });
    }
});

// Login endpoint with verification check
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ 
                error: 'Please verify your email before logging in',
                needsVerification: true 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Remove sensitive data before sending response
        const userResponse = {
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        };

        res.status(200).json({ user: userResponse });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'An error occurred during login. Please try again.' });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Generate reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send reset email
        const mailOptions = {
            from: {
                name: 'InterviewMate',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Password Reset Request - InterviewMate',
            html: getPasswordResetEmailTemplate(resetLink)
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link has been sent to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'An error occurred while resetting password. Please try again.' });
    }
});

module.exports = router;