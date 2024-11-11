import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
  Category,
} from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

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
    },
    {
      label: 'Job Details',
      icon: <WorkOutline />,
    },
    {
      label: 'Experience',
      icon: <Timer />,
    },
    {
      label: 'Domain',
      icon: <Category />,
    },
  ];

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  p: 5,
                  border: '2px dashed #1a237e',
                  borderRadius: '10px',
                  '&:hover': {
                    border: '2px dashed #0d47a1',
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                  },
                }}
              >
                {formData.resume ? formData.resume.name : 'Drag and drop or click to upload resume (PDF)'}
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={handleFileUpload}
                />
              </Button>
              {formData.resume && (
                <Button
                  variant="contained"
                  onClick={() => setPreviewOpen(true)}
                  startIcon={<Visibility />}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Job Role"
                  variant="outlined"
                  fullWidth
                  value={formData.jobRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobRole: e.target.value }))}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#1a237e' }}>
              Years of Experience:
            </Typography>
            <RadioGroup
              row
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 2,
              }}
            >
              {['0-1', '1-3', '3-5', '5+'].map((value) => (
                <Paper
                  key={value}
                  elevation={formData.experience === value ? 8 : 1}
                  sx={{
                    transition: 'all 0.3s ease',
                    transform: formData.experience === value ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <FormControlLabel
                    value={value}
                    control={<Radio />}
                    label={`${value} years`}
                    sx={{
                      m: 0,
                      p: 2,
                      width: '100%',
                      '& .MuiFormControlLabel-label': {
                        color: formData.experience === value ? '#1a237e' : 'inherit',
                      },
                    }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#1a237e' }}>Domain</InputLabel>
              <Select
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                label="Domain"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1a237e',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0d47a1',
                  },
                }}
              >
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Non Technical">Non Technical</MenuItem>
              </Select>
            </FormControl>
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
        pt: 4,
        pb: 6,
      }}
    >
      <ToastContainer position="top-center" autoClose={3000} />

      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 4,
              }}
            >
              Start Your Interview
            </Typography>

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
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent()}

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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: '#1a237e',
                  border: '1px solid #1a237e',
                  borderRadius: '25px',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  borderRadius: '25px',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
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

      {/* PDF Preview Dialog */}
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

      {/* Help Dialog - Optional */}
      <Dialog
        open={false} // Set to true when you want to show help
        onClose={() => {}} // Add handler
        maxWidth="sm"
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
          backgroundColor: '#1a237e', 
          color: '#fff' 
        }}>
          Need Help?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tips for a successful interview:
            </Typography>
            <Typography variant="body1" paragraph>
              1. Make sure your resume is up to date and in PDF format
            </Typography>
            <Typography variant="body1" paragraph>
              2. Provide detailed job description for better question matching
            </Typography>
            <Typography variant="body1" paragraph>
              3. Select the appropriate experience level and domain
            </Typography>
            <Typography variant="body1">
              4. Ensure you have a working microphone and camera
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Progress Overlay - Optional */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{ color: '#fff' }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff', 
              mt: 2 
            }}
          >
            Preparing Your Interview...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Start;
            