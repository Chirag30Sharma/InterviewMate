import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import { 
  FiArrowRight, 
  FiMenu,
  FiUser,
  FiZap,
  FiTarget,
  FiActivity,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiUsers,
  FiBriefcase,
  FiClock,
  FiBarChart,
  FiLayers
} from 'react-icons/fi';
import { 
  SiGoogle, 
  SiMeta, 
  SiApple, 
  SiAmazon, 
  SiMicrosoft,
  SiNetflix,
  SiUber,
  SiAirbnb,
  SiSlack 
} from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';
import EvaluationHistory from './EvaluationHistory';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem('userEmail'));

  // Enhanced features with gradients and modern descriptions
  const features = [
    {
      icon: <FiZap />,
      title: "AI-Powered Interviews",
      description: "Experience dynamic interviews that adapt in real-time to your responses",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
      color: "#FF6B6B"
    },
    {
      icon: <FiTarget />,
      title: "Smart Analytics",
      description: "Get detailed performance insights with advanced tracking metrics",
      gradient: "linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)",
      color: "#4E65FF"
    },
    {
      icon: <FiActivity />,
      title: "Growth Tracking",
      description: "Monitor your progress with comprehensive improvement analytics",
      gradient: "linear-gradient(135deg, #45B26B 0%, #DCF6E4 100%)",
      color: "#45B26B"
    },
    {
      icon: <FiBriefcase />,
      title: "Industry Focus",
      description: "Practice with scenarios tailored to your specific industry",
      gradient: "linear-gradient(135deg, #9C27B0 0%, #E1BEE7 100%)",
      color: "#9C27B0"
    }
  ];

  const statistics = [
    {
      icon: <FiClock size={24} />,
      value: "24/7",
      label: "Available Practice",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
    },
    {
      icon: <FiBarChart size={24} />,
      value: "95%",
      label: "Success Rate",
      gradient: "linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)"
    },
    {
      icon: <FiLayers size={24} />,
      value: "1000+",
      label: "Questions",
      gradient: "linear-gradient(135deg, #45B26B 0%, #DCF6E4 100%)"
    },
    {
      icon: <FiUsers size={24} />,
      value: "50K+",
      label: "Users",
      gradient: "linear-gradient(135deg, #9C27B0 0%, #E1BEE7 100%)"
    }
  ];

  // Companies with enhanced styling
  const companies = [
    { icon: <SiGoogle size={28} />, name: "Google" },
    { icon: <SiMeta size={28} />, name: "Meta" },
    { icon: <SiApple size={28} />, name: "Apple" },
    { icon: <SiAmazon size={28} />, name: "Amazon" },
    { icon: <SiMicrosoft size={28} />, name: "Microsoft" },
    { icon: <SiNetflix size={28} />, name: "Netflix" },
    { icon: <SiUber size={28} />, name: "Uber" },
    { icon: <SiAirbnb size={28} />, name: "Airbnb" },
    { icon: <SiSlack size={28} />, name: "Slack" }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Custom Gradient Button Component
  const GradientButton = ({ children, onClick, ...props }) => (
    <Button
      onClick={onClick}
      sx={{
        background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
        border: 0,
        borderRadius: '50px',
        boxShadow: '0 3px 5px 2px rgba(33, 147, 176, .3)',
        color: 'white',
        padding: '10px 30px',
        textTransform: 'none',
        fontSize: '1.1rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 15px 3px rgba(33, 147, 176, .3)',
        },
        ...props.sx
      }}
    >
      {children}
    </Button>
  );

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ 
                  mr: 2,
                  color: '#2193b0',
                  '&:hover': {
                    bgcolor: 'rgba(33, 147, 176, 0.1)'
                  }
                }}
              >
                <FiMenu size={24} />
              </IconButton>
            )}

            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              InterviewMate
            </Typography>

            {!isMobile && (
  <Stack direction="row" spacing={3} alignItems="center">
    {!isLoggedIn ? (
      <>
        <Button
          onClick={() => navigate('/login')}
          sx={{
            color: '#2193b0',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(33, 147, 176, 0.1)'
            }
          }}
        >
          Login
        </Button>
        <GradientButton onClick={() => navigate('/register')}>
                  Get Started
                </GradientButton>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    color: '#2193b0',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FiUser />
                  Welcome, {localStorage.getItem('userName')}
                </Typography>
                <GradientButton 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                  }}
                  endIcon={<FiArrowRight />}
                >
                  Logout
                </GradientButton>
              </>
            )}
          </Stack>
        )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3
            }}
          >
            InterviewMate
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {!isLoggedIn ? (
              <>
                <ListItem button onClick={() => navigate('/login')}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button onClick={() => navigate('/register')}>
                  <ListItemText primary="Get Started" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem>
                  <ListItemText 
                    primary={`Welcome, ${localStorage.getItem('userName')}`}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#2193b0',
                        fontWeight: 600,
                      }
                    }}
                  />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box sx={{ pt: { xs: 12, md: 20 }, pb: 10, position: 'relative' }}>
          {/* Animated background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(33,147,176,0.15) 0%, rgba(109,213,237,0) 70%)',
              filter: 'blur(60px)',
              zIndex: 0,
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          />

          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1.2,
                    mb: 4,
                  }}
                >
                  Master Your Future
                  <br />
                  One Interview at a Time
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#666',
                    fontWeight: 400,
                    mb: 6,
                    lineHeight: 1.6,
                  }}
                >
                  Practice with our AI-powered platform designed to help you ace
                  your next interview. Get real-time feedback and comprehensive analytics.
                </Typography>

                <Stack direction="row" spacing={3}>
                  <GradientButton 
                    onClick={() => navigate(isLoggedIn ? '/start' : '/register')}
                    endIcon={<FiArrowRight />}
                    sx={{ px: 6, py: 2 }}
                  >
                    {isLoggedIn ? 'Start Practice' : 'Try for Free'}
                  </GradientButton>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3"
                  alt="Interview Preparation"
                  sx={{
                    width: '100%',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(33, 147, 176, 0.2)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg)',
                    }
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Box>
        
        {/* Evaluation History Section */}
        {isLoggedIn && (
          <Box sx={{ py: 10 }}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 6,
              }}
            >
              Your Interview History
            </Typography>
            <EvaluationHistory />
          </Box>
        )}

        {/* Statistics Section */}
        <Box sx={{ py: 10 }}>
        <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 6,
              }}
            >
              About Us
            </Typography>

          <Grid container spacing={4}>
            {statistics.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: stat.gradient,
                        opacity: 0.1,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: stat.gradient,
                          color: 'white',
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          background: stat.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#666',
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 10 }}>
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2193b0 30%, #6dd5ed 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 8,
            }}
          >
            Why Choose Us?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paper
                    elevation={0}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: feature.gradient,
                        opacity: hoveredFeature === index ? 0.1 : 0,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: feature.gradient,
                          color: 'white',
                          mb: 2,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          background: feature.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#666',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Companies Section */}
        <Box sx={{ py: 10 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#666',
              mb: 6,
              fontWeight: 500,
            }}
          >
            Trusted by professionals from leading companies
          </Typography>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              spacing={4}
              sx={{ opacity: 0.7 }}
            >
              {companies.map((company, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, opacity: 1 }}
                >
                  <Box
                    sx={{
                      color: '#666',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#2193b0',
                      }
                    }}
                  >
                    {company.icon}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 6,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            mt: 10,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography
              variant="body2"
              sx={{ color: '#666' }}
            >
              © 2024 InterviewMate. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              {[
                { icon: <FiGithub size={20} />, link: 'https://github.com' },
                { icon: <FiLinkedin size={20} />, link: 'https://linkedin.com' },
                { icon: <FiTwitter size={20} />, link: 'https://twitter.com' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#666',
                    '&:hover': {
                      color: '#2193b0',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;