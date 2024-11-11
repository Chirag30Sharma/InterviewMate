import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Container,
  Avatar,
  Fade,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  MarkEmailRead,
  Email,
  ArrowForward,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const { token } = useParams();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
  };

  const verifyEmail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        toast.success('Email verification successful!');
      } else {
        setStatus('error');
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      toast.error('Network error. Please try again.');
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [retryCount]);

  const handleRetry = () => {
    if (retryCount < 3) {
      setStatus('verifying');
      setRetryCount(prev => prev + 1);
      toast.info('Retrying verification...');
    } else {
      toast.error('Maximum retry attempts reached. Please request a new verification link.');
    }
  };

  const getContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: <CircularProgress size={60} sx={{ color: '#1a237e' }} />,
          title: 'Verifying Your Email',
          description: 'Please wait while we verify your email address...',
          avatar: <Email sx={{ fontSize: 40 }} />,
        };
      case 'success':
        return {
          icon: <CheckCircle sx={{ fontSize: 60, color: '#4CAF50' }} />,
          title: 'Email Verified Successfully!',
          description: 'Your email has been verified. You can now access your account.',
          avatar: <MarkEmailRead sx={{ fontSize: 40 }} />,
        };
      case 'error':
        return {
          icon: <Error sx={{ fontSize: 60, color: '#f44336' }} />,
          title: 'Verification Failed',
          description: 'The verification link is invalid or has expired.',
          avatar: <Error sx={{ fontSize: 40 }} />,
        };
      default:
        return null;
    }
  };

  const content = getContent();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <ToastContainer position="top-center" />
      
      <Container maxWidth="sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
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
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#1a237e',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
                }}
              >
                {content.avatar}
              </Avatar>

              <motion.div variants={iconVariants}>
                <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {content.icon}
                </Box>
              </motion.div>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2,
                }}
              >
                {content.title}
              </Typography>

              <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                {content.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {status === 'error' && retryCount < 3 && (
                  <Button
                    variant="outlined"
                    onClick={handleRetry}
                    startIcon={<Refresh />}
                    sx={{
                      color: '#1a237e',
                      borderColor: '#1a237e',
                      '&:hover': {
                        borderColor: '#0d47a1',
                        backgroundColor: 'rgba(26, 35, 126, 0.04)',
                      },
                    }}
                  >
                    Retry Verification
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={() => navigate(status === 'success' ? '/login' : '/register')}
                  endIcon={<ArrowForward />}
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
                  {status === 'success' ? 'Go to Login' : 'Back to Register'}
                </Button>
              </Box>

              {status === 'error' && retryCount >= 3 && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: 'block', mt: 2 }}
                >
                  Maximum retry attempts reached. Please request a new verification link.
                </Typography>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default VerifyEmail;