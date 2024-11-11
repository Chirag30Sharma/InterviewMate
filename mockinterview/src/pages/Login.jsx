// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  Link,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
  LinkedIn
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleShowPassword = () => setShowPassword(!showPassword);

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

      if (response.ok) {
        localStorage.setItem('userEmail', email);
        toast.success('Login successful!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    toast.info(`${platform} login coming soon!`);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Container maxWidth="xs">
        <Paper
          component={motion.div}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
            }}
          >
            Welcome Back
          </Typography>

          <Box 
            component="form" 
            onSubmit={handleLogin} 
            sx={{ width: '100%' }}
          >
            <TextField
              required
              fullWidth
              margin="normal"
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a237e',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a237e',
                },
              }}
            />

            <TextField
              required
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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
                      onClick={handleShowPassword}
                      edge="end"
                      sx={{ color: '#1a237e' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a237e',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#1a237e',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                borderRadius: 2,
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

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 2,
              mb: 3
            }}>
              {[
                { icon: <Google />, platform: 'Google' },
                { icon: <GitHub />, platform: 'GitHub' },
                { icon: <LinkedIn />, platform: 'LinkedIn' }
              ].map((social, index) => (
                <IconButton
                  key={index}
                  onClick={() => handleSocialLogin(social.platform)}
                  sx={{
                    color: '#fff',
                    backgroundColor: '#1a237e',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Link 
                href="#" 
                variant="body2" 
                sx={{ 
                  color: '#1a237e',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
              <Link 
                href="/register" 
                variant="body2" 
                sx={{ 
                  color: '#1a237e',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;