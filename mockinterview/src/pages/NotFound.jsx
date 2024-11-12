import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Home,
  SearchOff,
  Help,
  BugReport,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const suggestions = [
    {
      icon: <Home sx={{ fontSize: 40 }} />,
      title: 'Return Home',
      description: 'Go back to the main page',
      action: () => navigate('/'),
    },
    {
      icon: <Help sx={{ fontSize: 40 }} />,
      title: 'Get Help',
      description: 'Visit our help center'
    },
    {
      icon: <BugReport sx={{ fontSize: 40 }} />,
      title: 'Report Issue',
      description: 'Let us know about this'
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />

      <Container maxWidth="md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <motion.div variants={itemVariants}>
              <SearchOff 
                sx={{ 
                  fontSize: 100, 
                  color: '#1a237e',
                  mb: 2,
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '4rem', md: '6rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2,
                }}
              >
                404
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: '#1a237e',
                  mb: 2,
                }}
              >
                Page Not Found
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
              >
                Oops! The page you're looking for seems to have wandered off into the digital abyss. 
                Don't worry though, we've got some suggestions to help you find your way back.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {suggestions.map((suggestion, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                        },
                      }}
                      onClick={suggestion.action}
                    >
                      <Box sx={{ color: '#1a237e', mb: 2 }}>
                        {suggestion.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {suggestion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  borderRadius: '50px',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                Go Back
              </Button>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFound;