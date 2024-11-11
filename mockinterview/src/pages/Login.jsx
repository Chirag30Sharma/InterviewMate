import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AccountCircle,
  ArrowForward,
  Key
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const validateForm = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', data.user.name);
        toast.success('Login successful!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        if (data.needsVerification) {
          toast.error('Please verify your email before logging in');
        } else {
          toast.error(data.error || 'Login failed');
        }
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // Clear any existing toasts
    toast.dismiss();

    // Basic email validation
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset link has been sent to your email');
        setForgotPasswordOpen(false);
        setResetEmail('');
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        pt: { xs: 4, md: 8 },
        pb: 8,
      }}
    >
      <ToastContainer position="top-center" />
      
      <Container maxWidth="sm">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={cardVariants}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#1a237e',
                  margin: '0 auto 16px',
                }}
              >
                <AccountCircle sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Sign in to continue your journey
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#1a237e' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#1a237e' },
                        '&.Mui-focused fieldset': { borderColor: '#1a237e' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#1a237e' },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#1a237e' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#1a237e' },
                        '&.Mui-focused fieldset': { borderColor: '#1a237e' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#1a237e' },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordOpen(true);
                  }}
                  sx={{
                    color: '#1a237e',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </Button>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForward />}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  href="/register"
                  variant="body1"
                  sx={{
                    color: '#1a237e',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => !resetLoading && setForgotPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Key sx={{ fontSize: 24 }} />
          Reset Password
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          <TextField
            autoFocus
            fullWidth
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#1a237e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#1a237e' },
                '&.Mui-focused fieldset': { borderColor: '#1a237e' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#1a237e' },
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => {
              setForgotPasswordOpen(false);
              setResetEmail('');
            }}
            disabled={resetLoading}
            sx={{ 
              color: '#1a237e',
              '&:hover': {
                backgroundColor: 'rgba(26, 35, 126, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={resetLoading}
            variant="contained"
            startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
              },
            }}
          >
            {resetLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;