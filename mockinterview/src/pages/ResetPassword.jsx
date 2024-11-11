import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Avatar,
  Grid,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  LockReset,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const { token } = useParams();
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

  // Password requirements checker
  useEffect(() => {
    const newRequirements = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
    setRequirements(newRequirements);

    // Calculate password strength
    const strength = Object.values(newRequirements).filter(Boolean).length * 20;
    setPasswordStrength(strength);
  }, [newPassword]);

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 20) return '#f44336';
    if (strength <= 40) return '#ff9800';
    if (strength <= 60) return '#ffd700';
    if (strength <= 80) return '#2196f3';
    return '#4caf50';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }
    if (passwordStrength < 60) {
      toast.error('Please create a stronger password');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.error || 'Password reset failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
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
      
      <Container maxWidth="sm">
        <AnimatePresence mode="wait">
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
                    width: 80,
                    height: 80,
                    backgroundColor: '#1a237e',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
                  }}
                >
                  <LockReset sx={{ fontSize: 45 }} />
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
                  Reset Password
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  Create a new secure password for your account
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    {newPassword && (
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
                            textAlign: 'right',
                          }}
                        >
                          {getPasswordStrengthText(passwordStrength)}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                </Grid>

                {/* Password Requirements List */}
                <List dense sx={{ mt: 2 }}>
                  {[
                    { key: 'length', text: 'At least 8 characters' },
                    { key: 'uppercase', text: 'One uppercase letter' },
                    { key: 'lowercase', text: 'One lowercase letter' },
                    { key: 'number', text: 'One number' },
                    { key: 'special', text: 'One special character' },
                  ].map((req) => (
                    <ListItem key={req.key} dense>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Fade in={true}>
                          {requirements[req.key] ? (
                            <CheckCircle sx={{ color: '#4caf50' }} />
                          ) : (
                            <Cancel sx={{ color: '#bdbdbd' }} />
                          )}
                        </Fade>
                      </ListItemIcon>
                      <ListItemText 
                        primary={req.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: requirements[req.key] ? '#4caf50' : '#757575',
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/login')}
                    startIcon={<ArrowBack />}
                    sx={{
                      color: '#1a237e',
                      borderColor: '#1a237e',
                      '&:hover': {
                        borderColor: '#0d47a1',
                        backgroundColor: 'rgba(26, 35, 126, 0.04)',
                      },
                    }}
                  >
                    Back to Login
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                    sx={{
                      background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                      boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default ResetPassword;