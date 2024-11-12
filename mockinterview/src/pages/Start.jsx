import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  LinearProgress,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload,
  ArrowForward,
  Visibility,
  Close,
  FilePresent,
  WorkOutline,
  Description,
  Timer,
  Code,
  People,
  Category,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const Start = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    resume: null,
    jobRole: '',
    jobDescription: '',
    experience: '',
    domain: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      label: 'Upload Resume',
      icon: <FilePresent />,
      description: 'Upload your latest resume in PDF format',
    },
    {
      label: 'Job Details',
      icon: <WorkOutline />,
      description: 'Provide information about the position',
    },
    {
      label: 'Experience',
      icon: <Timer />,
      description: 'Specify your experience level',
    },
    {
      label: 'Domain',
      icon: <Category />,
      description: 'Select your interview domain',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
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

  useEffect(() => {
    const storedResume = localStorage.getItem('storedResume');
    if (storedResume) {
      const resumeFile = dataURLtoFile(storedResume, localStorage.getItem('resumeName') || 'resume.pdf');
      setFormData(prev => ({ ...prev, resume: resumeFile }));
    }
  }, []);

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('storedResume', reader.result);
        localStorage.setItem('resumeName', file.name);
        setFormData(prev => ({ ...prev, resume: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.resume) {
          toast.error('Please upload your resume');
          return false;
        }
        return true;
      case 1:
        if (!formData.jobRole || !formData.jobDescription) {
          toast.error('Please fill in all job details');
          return false;
        }
        return true;
      case 2:
        if (!formData.experience) {
          toast.error('Please select your experience level');
          return false;
        }
        return true;
      case 3:
        if (!formData.domain) {
          toast.error('Please select your domain');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('resume', formData.resume);
    formDataToSend.append('job_role', formData.jobRole);
    formDataToSend.append('job_description', formData.jobDescription);
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('domain', formData.domain);

    try {
      const response = await axios.post('http://127.0.0.1:5000/start_interview', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      toast.success('Interview started successfully!');
      navigate('/interview', { 
        state: { 
          question: response.data.question,
          question_number: response.data.question_number,
          interview_start_time: response.data.interview_start_time
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error starting the interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Upload Your Resume
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  border: '2px dashed #1a237e',
                  borderRadius: 2,
                  backgroundColor: 'rgba(26, 35, 126, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    transform: 'translateY(-2px)',
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileUpload}
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2 
                }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#1a237e',
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 30 }} />
                  </Avatar>
                  
                  {/* Fixed Typography structure */}
                  <Box sx={{ textAlign: 'center' }}>
                    {formData.resume ? (
                      <Typography 
                        variant="body1" 
                        component="div" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: 1 
                        }}
                      >
                        <CheckCircle color="success" />
                        <span>{formData.resume.name}</span>
                      </Typography>
                    ) : (
                      <Typography variant="body1">
                        Drag and drop your resume here or click to browse
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="textSecondary">
                    Supported format: PDF (Max size: 5MB)
                  </Typography>
                </Box>
              </Paper>
      
              {formData.resume && (
                <Button
                  variant="outlined"
                  onClick={() => setPreviewOpen(true)}
                  startIcon={<Visibility />}
                  sx={{
                    borderColor: '#1a237e',
                    color: '#1a237e',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    },
                  }}
                >
                  Preview Resume
                </Button>
              )}
            </Box>
          </motion.div>
        );
        
      case 1:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Job Details
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Job Role"
                  variant="outlined"
                  fullWidth
                  value={formData.jobRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobRole: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <WorkOutline sx={{ color: '#1a237e', mr: 1 }} />
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
                <TextField
                  label="Job Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  InputProps={{
                    startAdornment: (
                      <Description sx={{ color: '#1a237e', mr: 1, mt: 1 }} />
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
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Years of Experience
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Select your experience level to help us tailor the interview questions
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {['0-1', '1-3', '3-5', '5+'].map((value) => (
                <Grid item xs={12} sm={6} md={3} key={value}>
                  <Card
                    elevation={formData.experience === value ? 8 : 1}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: formData.experience === value ? 'scale(1.05)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <CardContent>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <Avatar
                          sx={{
                            bgcolor: formData.experience === value ? '#1a237e' : 'rgba(26, 35, 126, 0.1)',
                            width: 50,
                            height: 50,
                          }}
                        >
                          <Timer />
                        </Avatar>
                        <Typography
                          variant="h6"
                          sx={{
                            color: formData.experience === value ? '#1a237e' : 'text.primary',
                            fontWeight: formData.experience === value ? 600 : 400,
                          }}
                        >
                          {value} years
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Interview Domain
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Choose the type of interview you'd like to practice
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  value: 'Technical',
                  title: 'Technical Interview',
                  description: 'Focus on technical skills, coding, and problem-solving',
                  icon: <Code />,
                },
                {
                  value: 'Non Technical',
                  title: 'HR Interview',
                  description: 'Focus on behavioral questions and soft skills',
                  icon: <People />,
                },
              ].map((option) => (
                <Grid item xs={12} sm={6} key={option.value}>
                  <Card
                    elevation={formData.domain === option.value ? 8 : 1}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: formData.domain === option.value ? 'scale(1.05)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, domain: option.value }))}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                      }}>
                        <Avatar
                          sx={{
                            bgcolor: formData.domain === option.value ? '#1a237e' : 'rgba(26, 35, 126, 0.1)',
                            width: 60,
                            height: 60,
                          }}
                        >
                          {option.icon}
                        </Avatar>
                        <Typography
                          variant="h6"
                          align="center"
                          sx={{
                            color: formData.domain === option.value ? '#1a237e' : 'text.primary',
                            fontWeight: formData.domain === option.value ? 600 : 400,
                          }}
                        >
                          {option.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          align="center"
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        pt: { xs: 4, md: 8 },
        pb: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Gradient Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />

      <ToastContainer position="top-center" />
      
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {/* Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                mb: 4,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Home
            </Button>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: 'white',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Start Your Interview
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Complete the following steps to begin your personalized interview session
            </Typography>
          </Box>

          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Stepper */}
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ 
                mb: 6,
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
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: activeStep === index ? '#1a237e' : 'rgba(26, 35, 126, 0.2)',
                          transform: activeStep === index ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {step.icon}
                      </Avatar>
                    )}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: activeStep === index ? '#1a237e' : 'text.secondary',
                        fontWeight: activeStep === index ? 600 : 400,
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Content */}
            <Box sx={{ minHeight: '300px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {getStepContent()}
                </motion.div>
              </AnimatePresence>
            </Box>

            {/* Progress Bar for Upload */}
            {loading && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e3f2fd',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: '#1a237e',
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {uploadProgress}% Complete
                </Typography>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 6,
              pt: 3,
              borderTop: '1px solid rgba(0,0,0,0.1)'
            }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                startIcon={<ArrowBack />}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: '#1a237e',
                  border: '1px solid #1a237e',
                  borderRadius: '50px',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                  },
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={loading}
                endIcon={loading ? undefined : <ArrowForward />}
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
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === steps.length - 1 ? (
                  'Start Interview'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Resume Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          backgroundColor: '#1a237e', 
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between' 
        }}>
          Resume Preview
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh' }}>
          <Box
            component="iframe"
            src={formData.resume ? URL.createObjectURL(formData.resume) : ''}
            width="100%"
            height="100%"
            sx={{ border: 'none' }}
            title="Resume Preview"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Start;