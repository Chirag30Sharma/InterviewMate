import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  FiClock,
  FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EvaluationHistory = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluations = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User email not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/evaluationhistory/user-evaluations/${userEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch evaluations');
        }
        const data = await response.json();
        setEvaluations(data);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return Number(score).toFixed(1);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FFC107';
    return '#FF5252';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2 }}
          icon={<FiAlertCircle size={24} />}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <AnimatePresence>
        {evaluations && evaluations.length > 0 ? (
          <Grid container spacing={3}>
            {evaluations.map((evaluation, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(45deg, ${getScoreColor(
                              evaluation?.average_score
                            )}, ${getScoreColor(evaluation?.average_score)}88)`,
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {formatScore(evaluation?.average_score)}
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#1A1A1A' }}
                          >
                            Score
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            out of 10
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#666',
                          }}
                        >
                          <FiClock size={16} />
                          {formatDate(evaluation?.createdAt)}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<FiChevronRight />}
                        onClick={() =>
                          navigate(`/evaluationDetails`, {
                            state: { evaluation },
                          })
                        }
                        sx={{
                          background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
                          borderRadius: '12px',
                          textTransform: 'none',
                          py: 1.5,
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1c7a94 30%, #5bc1d9 90%)',
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                backgroundColor: 'rgba(33, 147, 176, 0.1)',
                color: '#2193b0',
                '& .MuiAlert-icon': {
                  color: '#2193b0',
                },
              }}
            >
              No evaluations found. Start your first interview to see results here!
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default EvaluationHistory;