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
  Grid,
  Divider,
  Avatar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AccountCircle,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  ErrorOutline,
  GitHub,
  Google,
  LinkedIn,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
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

  const steps = [
    {
      label: 'Personal Information',
      description: 'Start with your basic details',
      icon: <Person />,
    },
    {
      label: 'Account Security',
      description: 'Set up your login credentials',
      icon: <Lock />,
    },
    {
      label: 'Confirmation',
      description: 'Review and complete registration',
      icon: <CheckCircle />,
    },
  ];

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return '#f44336';
    if (strength <= 50) return '#ff9800';
    if (strength <= 75) return '#ffd700';
    return '#4caf50';
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
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
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters long');
          return false;
        }
        if (passwordStrength < 75) {
          toast.error('Please create a stronger password');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        if (!formData.agreeToTerms) {
          toast.error('Please agree to the Terms and Conditions');
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

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please check your email to verify your account.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
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
      
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
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
                  width: 80,
                  height: 80,
                  backgroundColor: '#1a237e',
                  margin: '0 auto 16px',
                }}
              >
                <AccountCircle sx={{ fontSize: 50 }} />
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
                Create Your Account
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Join InterviewMate and start your journey
              </Typography>
            </Box>

            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#1a237e',
                },
                '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                  color: '#1a237e',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#0d47a1',
                },
              }}
            >
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    icon={
                      <motion.div
                        animate={{
                          scale: activeStep === index ? 1.2 : 1,
                          opacity: activeStep === index ? 1 : 0.7,
                        }}
                      >
                        {step.icon}
                      </motion.div>
                    }
                  >
                    <Typography variant="subtitle2">{step.label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
                  <Grid container spacing={3}>
                    {activeStep === 0 && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
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
                      </Grid>
                    )}

                    {activeStep === 1 && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
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
                      </Grid>
                    )}

                    {activeStep === 2 && (
                      <>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Password"
                            name="password"
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
                          {formData.password && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={passwordStrength}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: getPasswordStrengthColor(passwordStrength),
                                    borderRadius: 4,
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getPasswordStrengthColor(passwordStrength),
                                  display: 'block',
                                  mt: 0.5,
                                }}
                              >
                                Password Strength: {passwordStrength}%
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
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
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
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
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                sx={{
                                  color: '#1a237e',
                                  '&.Mui-checked': {
                                    color: '#1a237e',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2" color="textSecondary">
                                I agree to the Terms and Conditions
                              </Typography>
                            }
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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

                    <Button
                      type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                      onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                      variant="contained"
                      endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : activeStep === steps.length - 1 ? (
                        'Complete Registration'
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </Box>
                </form>
              </motion.div>
            </AnimatePresence>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
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
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;