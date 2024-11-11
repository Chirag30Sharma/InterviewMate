// Register.jsx
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
  Link,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Account Setup', 'Confirmation'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.name.trim()) {
          toast.error('Please enter your name');
          return false;
        }
        if (formData.name.length < 2) {
          toast.error('Name must be at least 2 characters long');
          return false;
        }
        return true;
      case 1:
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        toast.success('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TextField
              required
              fullWidth
              margin="normal"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#1a237e' }} />
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
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TextField
              required
              fullWidth
              margin="normal"
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
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
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TextField
              required
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
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
            <TextField
              required
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
          </motion.div>
        );
      default:
        return null;
    }
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
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
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
            Create Account
          </Typography>

          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {getStepContent()}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                sx={{
                  color: '#1a237e',
                  '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.04)' },
                }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                    },
                  }}
                >
                  {loading ? 'Creating...' : 'Complete'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Link
              href="/login"
              variant="body2"
              sx={{
                color: '#1a237e',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Already have an account? Sign in
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;