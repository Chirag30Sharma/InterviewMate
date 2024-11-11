import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Container
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

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
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {status === 'verifying' && (
              <>
                <CircularProgress size={60} sx={{ color: '#1a237e', mb: 2 }} />
                <Typography variant="h5">
                  Verifying your email...
                </Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Email Verified Successfully!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Your email has been verified. You can now log in to your account.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    color: 'white',
                  }}
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <Error sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Verification Failed
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  The verification link is invalid or has expired.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    color: 'white',
                  }}
                >
                  Back to Register
                </Button>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VerifyEmail;