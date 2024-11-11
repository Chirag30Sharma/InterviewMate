import '@babel/runtime-corejs3/regenerator';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import screenfull from 'screenfull';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ExitToApp,
  Warning,
  AccessTime,
  QuestionAnswer,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Interview = () => {
  // Location and Navigation
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Speech Recognition
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Refs
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  // State Declarations
  const [mediaStream, setMediaStream] = useState(null);
  const [question, setQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState('');
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [transcriptionStarted, setTranscriptionStarted] = useState(false);

  const speechSynthesis = window.speechSynthesis;
  const MAX_WARNINGS = 2;
  // Event Handlers with useCallback
const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isFullScreen) {
      setWarningCount(prev => {
        const newCount = prev + 1;
        if (newCount > MAX_WARNINGS) {
          toast.error('Interview terminated due to multiple tab switches.');
          confirmExit();
          return prev;
        }
        toast.warning(`Warning: Please don't switch tabs during interview! (Warning ${newCount}/${MAX_WARNINGS})`);
        return newCount;
      });
    }
  }, [isFullScreen]);
  
  const handleFullScreenChange = useCallback(() => {
    if (!document.fullscreenElement && isFullScreen) {
      setWarningCount(prev => {
        const newCount = prev + 1;
        if (newCount > MAX_WARNINGS) {
          toast.error('Interview terminated due to multiple full screen exits.');
          confirmExit();
          return prev;
        }
        toast.warning(`Warning: Please stay in full screen mode! (Warning ${newCount}/${MAX_WARNINGS})`);
        return newCount;
      });
    }
    setIsFullScreen(!!document.fullscreenElement);
  }, [isFullScreen]);
  
  // Utility Functions
  const speakQuestion = (text) => {
    if (!isSpeakerEnabled) return;
    
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US');
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  
    speechSynthesis.speak(utterance);
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Media Controls
  const toggleVideo = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  const toggleAudio = async () => {
    try {
      if (mediaStream) {
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsAudioEnabled(!isAudioEnabled);
  
        if (isAudioEnabled) {
          await SpeechRecognition.stopListening();
        } else {
          await SpeechRecognition.startListening({ continuous: true });
        }
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle audio. Please try again.');
    }
  };
  
  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    if (isSpeakerEnabled) {
      speechSynthesis.cancel();
    } else {
      speakQuestion(question);
    }
  };
  
  // Exit Handlers
  const handleExit = async () => {
    if (screenfull.isEnabled && isFullScreen) {
      try {
        await screenfull.exit();
        setIsFullScreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
    setExitDialogOpen(true);
  };
  
  const confirmExit = async () => {
    try {
      // Stop all media tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
  
      // Stop speech recognition
      SpeechRecognition.stopListening();
      resetTranscript();
  
      // Cancel any ongoing speech
      speechSynthesis.cancel();
  
      // Exit fullscreen with proper check
      if (screenfull.isEnabled) {
        await screenfull.exit();
      }
  
      // Clear any timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  
      // Reset states
      setIsFullScreen(false);
      setExitDialogOpen(false);
  
      // Navigate after cleanup
      setTimeout(() => {
        navigate('/');
      }, 100);
  
    } catch (error) {
      console.error('Error during exit:', error);
      // Force navigation if cleanup fails
      navigate('/');
    }
  };
  
  // Keyboard Prevention
  useEffect(() => {
    const preventDefaultKeys = (e) => {
      if (e.altKey && e.key === 'Tab') e.preventDefault();
      if (e.altKey && e.key === 'F4') e.preventDefault();
      if (e.ctrlKey && e.key === 'w') e.preventDefault();
      if (e.key === 'F11') e.preventDefault();
    };
  
    window.addEventListener('keydown', preventDefaultKeys);
    return () => window.removeEventListener('keydown', preventDefaultKeys);
  }, []);
  // Initialization Effect
useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Check browser support
        if (!browserSupportsSpeechRecognition) {
          throw new Error('Browser does not support speech recognition.');
        }
  
        // Initialize media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
  
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
  
        // Request full screen
        if (containerRef.current && screenfull.isEnabled) {
          await screenfull.request(containerRef.current);
          setIsFullScreen(true);
        }
  
        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
  
        // Start speech recognition automatically
        await SpeechRecognition.startListening({ continuous: true });
        setTranscriptionStarted(true);
        setIsAudioEnabled(true);
  
        toast.success('Interview initialized successfully!');
      } catch (err) {
        console.error('Initialization error:', err);
        toast.error(err.message || 'Failed to initialize interview. Please check your permissions and try again.');
      }
    };
  
    initializeInterview();
  
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      SpeechRecognition.stopListening();
      if (screenfull.isEnabled && isFullScreen) {
        screenfull.exit();
      }
    };
  }, [handleVisibilityChange, handleFullScreenChange, browserSupportsSpeechRecognition]);
  
  // Interview State Effect
  useEffect(() => {
    if (state) {
      const { question, question_number, interview_start_time } = state;
      setQuestion(question);
      setQuestionNumber(question_number);
      setInterviewStartTime(interview_start_time);
      speakQuestion(question);
    }
  
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [state]);
  
  // Fullscreen Cleanup Effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (screenfull.isEnabled && isFullScreen) {
        screenfull.exit();
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (screenfull.isEnabled && isFullScreen) {
        screenfull.exit();
      }
    };
  }, [isFullScreen]);
  
  // Answer Processing Effect
  useEffect(() => {
    const sendAnswer = async () => {
      if (!transcript || isInterviewComplete || !transcriptionStarted) return;
  
      setQaHistory(prev => [...prev, { question, answer: transcript }]);
      setIsLoading(true);
  
      try {
        const response = await fetch('http://127.0.0.1:5000/continue_interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question,
            answer: transcript,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.message === "Interview completed") {
          setIsInterviewComplete(true);
          if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
          }
          if (screenfull.isEnabled && isFullScreen) {
            screenfull.exit();
          }
          SpeechRecognition.stopListening();
          
          navigate('/evaluation', {
            state: {
              evaluation: {
                ...data.evaluation,
                qa_pairs: [...qaHistory, { question, answer: transcript }],
              },
            },
          });
        } else {
          setQuestion(data.question);
          setQuestionNumber(data.question_number);
          speakQuestion(data.question);
          resetTranscript();
          if (!listening && isAudioEnabled) {
            await SpeechRecognition.startListening({ continuous: true });
          }
        }
      } catch (error) {
        console.error('Error sending answer:', error);
        toast.error('Failed to process response. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  
    // Only send answer if transcript has meaningful content
    if (transcript && transcript.trim().length > 0) {
      timeoutRef.current = setTimeout(() => {
        sendAnswer();
      }, 3000); // Reduced from 5000 to 3000 for better responsiveness
    }
  
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    transcript,
    question,
    mediaStream,
    navigate,
    listening,
    isAudioEnabled,
    qaHistory,
    isInterviewComplete,
    isFullScreen,
    transcriptionStarted
  ]);
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        height: '100vh', 
        display: 'flex',
        backgroundColor: '#000',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        '& *': {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }
      }}
    >
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
  
      {/* Left Side - AI Avatar */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          position: 'relative',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="https://img.freepik.com/premium-photo/3d-interview-icon-journalism-information-gathering-illustration-logo_762678-91416.jpg"
            alt="AI Interviewer"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              marginBottom: '2rem',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
            }}
          />
        </motion.div>
  
        <Box sx={{ width: '100%', maxWidth: '600px' }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTime sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="textSecondary">
                {formatTime(elapsedTime)}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
              Question {questionNumber}
            </Typography>
          </Paper>
  
          <AnimatePresence mode="wait">
            <motion.div
              key={question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  borderRadius: 2,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {question}
                </Typography>
              </Paper>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
  
      {/* Right Side - Video Feed */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          position: 'relative',
          backgroundColor: '#000',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </motion.div>
        {/* Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={toggleVideo}
            sx={{ 
              color: 'white',
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
              }
            }}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <IconButton
            onClick={toggleAudio}
            sx={{ 
              color: 'white',
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
              }
            }}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton
            onClick={toggleSpeaker}
            sx={{ 
              color: 'white',
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
              }
            }}
          >
            {isSpeakerEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<ExitToApp />}
          onClick={handleExit}
          sx={{
            backgroundColor: alpha(theme.palette.error.main, 0.9),
            '&:hover': {
              backgroundColor: theme.palette.error.dark,
            },
          }}
        >
          Exit
        </Button>
      </Box>

      {/* Transcription Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 70,
          left: 24,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          padding: '4px 12px',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: listening ? '#4caf50' : '#f44336',
            animation: listening ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.5)',
                opacity: 0.5,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
        <Typography variant="caption" color="textSecondary">
          {listening ? 'Listening...' : 'Microphone off'}
        </Typography>
      </Box>

      {/* Answer Display */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          zIndex: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <QuestionAnswer />
            <Typography variant="subtitle1">Your Response:</Typography>
          </Box>
          <Typography 
            variant="body1"
            sx={{
              minHeight: '60px',
              maxHeight: '120px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {transcript || 'Listening for your answer...'}
          </Typography>
        </Paper>
      </Box>
    </Box>

    {/* Loading Overlay */}
    {isLoading && (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )}

    {/* Exit Confirmation Dialog */}
    <Dialog
      open={exitDialogOpen}
      onClose={() => setExitDialogOpen(false)}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Exit Interview
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to exit the interview? Your progress will be lost.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExitDialogOpen(false)}>Cancel</Button>
        <Button onClick={confirmExit} color="error" variant="contained">
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};

export default Interview;