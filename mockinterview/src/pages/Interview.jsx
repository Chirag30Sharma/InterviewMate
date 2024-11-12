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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [transcriptionStarted, setTranscriptionStarted] = useState(false);

  const speechSynthesis = window.speechSynthesis;

  // Utility Functions and Event Handlers
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isFullScreen) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          toast.error('Interview terminated due to multiple tab switches.');
          confirmExit();
          navigate('/');
          return prev;
        }
        toast.warning(`Warning: Please don't switch tabs! (Warning ${newCount}/2)`);
        return newCount;
      });
    }
  }, [isFullScreen, navigate]);

  const handleFullScreenChange = useCallback(() => {
    if (!document.fullscreenElement && isFullScreen) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          toast.error('Interview terminated due to multiple full screen exits.');
          confirmExit();
          return prev;
        }
        toast.warning(`Warning: Please stay in full screen mode! (Warning ${newCount}/2)`);
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
      if (SpeechRecognition.browserSupportsSpeechRecognition()) {
        SpeechRecognition.stopListening();
      }
      resetTranscript();

      // Cancel any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Exit fullscreen with proper check
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        await screenfull.exit();
      }

      // Clear any timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset states
      setIsFullScreen(false);
      setExitDialogOpen(false);

      // Navigate after cleanup with a small delay
      setTimeout(() => {
        navigate('/');
      }, 100);

    } catch (error) {
      console.error('Error during exit:', error);
      // Force navigation if cleanup fails
      navigate('/');
    }
  };
  // Initialization Effect
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Create a function to handle permissions
        const checkPermissions = async () => {
          const permissions = await Promise.all([
            navigator.permissions.query({ name: 'camera' }),
            navigator.permissions.query({ name: 'microphone' })
          ]);

          const deniedPermissions = permissions.filter(p => p.state === 'denied');
          if (deniedPermissions.length > 0) {
            throw new Error('Camera and microphone permissions are required for the interview.');
          }
        };

        // Check browser support first
        if (!browserSupportsSpeechRecognition) {
          throw new Error('Browser does not support speech recognition.');
        }

        // Check permissions before accessing media
        await checkPermissions();

        // Initialize media stream with error handling
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true,
          });

          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (mediaError) {
          throw new Error('Failed to access camera or microphone. Please ensure permissions are granted.');
        }

        // Request full screen with error handling
        if (containerRef.current && screenfull.isEnabled) {
          try {
            await screenfull.request(containerRef.current);
            setIsFullScreen(true);
          } catch (fullscreenError) {
            console.warn('Fullscreen request failed:', fullscreenError);
            // Continue without fullscreen rather than throwing error
          }
        }

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        // Start speech recognition
        await SpeechRecognition.startListening({ continuous: true });
        setTranscriptionStarted(true);
        setIsAudioEnabled(true);

        toast.success('Interview initialized successfully!');
      } catch (err) {
        console.error('Initialization error:', err);
        toast.error(err.message || 'Failed to initialize interview. Please check your permissions and try again.');
        // Navigate away after error
        setTimeout(() => navigate('/'), 2000);
      }
    };

    initializeInterview();

    // Cleanup function
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (SpeechRecognition.browserSupportsSpeechRecognition()) {
        SpeechRecognition.stopListening();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (screenfull.isEnabled && isFullScreen) {
        screenfull.exit();
      }
      setTabSwitchCount(0);
    };
  }, [handleVisibilityChange, handleFullScreenChange, browserSupportsSpeechRecognition, navigate, isFullScreen]);

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

    if (transcript && transcript.trim().length > 0) {
      timeoutRef.current = setTimeout(() => {
        sendAnswer();
      }, 3000);
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

        {/* Transcription Status and Answer Display */}
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