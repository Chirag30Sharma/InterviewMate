import React from 'react';
import { useNavigate } from 'react-router-dom';
import EvaluationHistory from './EvaluationHistory';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Box,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Assessment,
  Computer,
  Psychology,
  ContactSupport,
  Menu as MenuIcon,
  ArrowForward,
  CheckCircle,
  Speed,
  Timeline,
  EmojiObjects
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoggedIn = Boolean(localStorage.getItem('userEmail'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const features = [
    {
      icon: <Assessment sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: "Smart Analytics",
      description: "Get detailed insights into your interview performance with AI-powered analytics"
    },
    {
      icon: <Computer sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: "Real-time Feedback",
      description: "Receive instant feedback on your responses during mock interviews"
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: "Personalized Learning",
      description: "Adaptive question generation based on your experience and performance"
    },
    {
      icon: <ContactSupport sx={{ fontSize: 40, color: '#F44336' }} />,
      title: "Expert Guidance",
      description: "Access curated resources and industry-specific interview preparation tips"
    }
  ];

  const stats = [
    { number: "95%", text: "Success Rate", icon: <CheckCircle color="success" /> },
    { number: "24/7", text: "Availability", icon: <Speed color="primary" /> },
    { number: "50+", text: "Industries Covered", icon: <Timeline color="secondary" /> },
    { number: "1000+", text: "Interview Questions", icon: <EmojiObjects color="warning" /> }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleStart = () => {
    if (isLoggedIn) {
      navigate('/start');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h5" sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            InterviewMate
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isLoggedIn ? (
                <Button 
                  variant="outlined" 
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: '20px',
                    borderColor: '#2196F3',
                    color: '#2196F3',
                    '&:hover': {
                      borderColor: '#1976D2',
                      backgroundColor: 'rgba(33, 150, 243, 0.08)'
                    }
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      borderRadius: '20px',
                      color: '#2196F3'
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      borderRadius: '20px',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)'
                      }
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            backgroundColor: '#fff',
            boxSizing: 'border-box' 
          },
        }}
      >
        <List>
          {isLoggedIn ? (
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <>
              <ListItem button onClick={() => navigate('/login')}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button onClick={() => navigate('/register')}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h2" gutterBottom sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1.2
              }}>
                Master Your 
                Interview Skills
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#666', 
                mb: 4,
                lineHeight: 1.6
              }}>
                Practice with our AI-powered platform that provides real-time feedback
                and personalized coaching to help you land your dream job.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleStart}
                endIcon={<ArrowForward />}
                sx={{ 
                  borderRadius: '30px',
                  padding: '12px 40px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}
              >
                Start Practicing Now
              </Button>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box className="shadow-lg rounded-4 overflow-hidden">
                <img 
                  src="https://img.freepik.com/free-vector/job-interview-conversation_74855-7566.jpg" 
                  alt="Interview"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
        {/* Evaluation History Section */}
        {isLoggedIn && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ 
              fontWeight: 700,
              mb: 6,
              color: '#1976D2'
            }}>
              Your Interview History
            </Typography>
            <EvaluationHistory />
          </Box>
        )}

        {/* Statistics Section */}
        <Box sx={{ mt: 10, mb: 10 }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card elevation={0} sx={{
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '15px',
                    p: 2
                  }}>
                    {stat.icon}
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700,
                      my: 1,
                      color: '#1976D2'
                    }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.text}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ 
            fontWeight: 700,
            mb: 6,
            color: '#1976D2'
          }}>
            Why Choose InterviewMate?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card sx={{
                    height: '100%',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: 'none',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ 
                      textAlign: 'center',
                      p: 4
                    }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default Home;