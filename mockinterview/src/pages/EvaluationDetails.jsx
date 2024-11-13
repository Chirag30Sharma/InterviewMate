import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import {
  QuestionMark,
  FiberManualRecord,
  FileDownload,
  School,
  MenuBook,
} from '@mui/icons-material';
import { generatePDF } from '../utils/pdfGenerator';
import {
  ArrowBack,
  Assessment,
  Chat,
  Code,
  Timeline,
  ExpandMore,
  Build,
  TrendingUp,
  Assignment,
  Schedule,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const extractMetricsFromDetailedEvaluation = (detailedEvaluation) => {
  try {
    const responseQualityMatch = detailedEvaluation.match(/Response Quality: (\d+\.?\d*)/);
    const technicalAccuracyMatch = detailedEvaluation.match(/Technical Accuracy: (\d+\.?\d*)/);
    const communicationMatch = detailedEvaluation.match(/Communication Score: (\d+\.?\d*)/);
    const problemSolvingMatch = detailedEvaluation.match(/Problem-solving: (\d+\.?\d*)/);

    return {
      response_quality: responseQualityMatch ? parseFloat(responseQualityMatch[1]) : 0,
      technical_accuracy: technicalAccuracyMatch ? parseFloat(technicalAccuracyMatch[1]) : 0,
      communication_score: communicationMatch ? parseFloat(communicationMatch[1]) : 0,
      problem_solving: problemSolvingMatch ? parseFloat(problemSolvingMatch[1]) : 0
    };
  } catch (error) {
    console.error('Error extracting metrics:', error);
    return {
      response_quality: 0,
      technical_accuracy: 0,
      communication_score: 0,
      problem_solving: 0
    };
  }
};


const EvaluationDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('summary');
  const [expandedSection, setExpandedSection] = useState(null);

  const evaluation = state?.evaluation || {};
  console.log(evaluation);
  const extractedMetrics = extractMetricsFromDetailedEvaluation(evaluation.detailed_evaluation || '');
  const metrics = {
    ...extractedMetrics,
    ...(evaluation.metrics || {})
  };

  const sections = [
    { id: 'summary', label: 'Summary', icon: <Assessment /> },
    { id: 'qa', label: 'Q&A Review', icon: <Chat /> },
    { id: 'detailed', label: 'Detailed Analysis', icon: <Timeline /> },
  ];

  const getUniqueQuestions = (qa_pairs) => {
    const seen = new Set();
    return qa_pairs.filter(qa => {
      if (seen.has(qa.question)) {
        return false;
      }
      seen.add(qa.question);
      return true;
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FFC107';
    return '#F44336';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 8.5) return { text: 'Excellent', color: '#4CAF50' };
    if (score >= 7) return { text: 'Good', color: '#2196F3' };
    if (score >= 5) return { text: 'Fair', color: '#FFC107' };
    return { text: 'Needs Improvement', color: '#F44336' };
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleExpandSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatEvaluationSection = (content) => {
    if (!content) return [];
  
    // If content is a JSON string, parse it first
    let evaluationContent = content;
    if (typeof content === 'string' && content.startsWith('{')) {
      try {
        const parsedContent = JSON.parse(content);
        evaluationContent = Object.entries(parsedContent)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      } catch (e) {
        console.error('Error parsing JSON content:', e);
      }
    }
  
    // Split into numbered sections and filter out empty lines
    const sections = evaluationContent
      .split(/(?=\d+\.\s)/)
      .filter(section => section.trim())
      .map(section => ({
        title: section.trim(),
        content: [] // Empty content since we're putting everything in the title
      }));
  
    return sections;
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const renderSummarySection = () => {
    const performanceLabel = getPerformanceLabel(evaluation.average_score);
    const uniqueQuestionCount = getUniqueQuestions(evaluation.qa_pairs || []).length;

    return (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      >
      <Grid container spacing={3}>
        {/* Performance Overview Card */}
        <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
          Performance Overview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Typography variant="h3" component="div">
            {evaluation.average_score.toFixed(1)}
          </Typography>
          <Box>
            <Chip
            label={performanceLabel.text}
            sx={{
              backgroundColor: performanceLabel.color,
              color: 'white',
              fontWeight: 'bold',
            }}
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Overall Performance
            </Typography>
          </Box>
          </Box>
        </Paper>
        </Grid>

        {/* Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Response Quality"
          value={metrics.response_quality?.toFixed(1)}
          icon={<Assessment />}
          color="#2196F3"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Technical Accuracy"
          value={metrics.technical_accuracy?.toFixed(1)}
          icon={<Code />}
          color="#4CAF50"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Communication"
          value={metrics.communication_score?.toFixed(1)}
          icon={<Chat />}
          color="#FF9800"
        />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Problem Solving"
          value={metrics.problem_solving?.toFixed(1)}
          icon={<Build />}
          color="#9C27B0"
        />
        </Grid>

        {/* Interview Stats */}
        <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
          Interview Statistics
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatItem
            icon={<Schedule />}
            label="Duration"
            value={formatTime(evaluation.interview_duration)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatItem
            icon={<Assignment />}
            label="Questions"
            value={uniqueQuestionCount}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatItem
            icon={<TrendingUp />}
            label="Completion"
            value="100%"
            />
          </Grid>
          </Grid>
        </Paper>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
        variant="contained"
        startIcon={<FileDownload />}
        onClick={() => generatePDF(evaluation)}
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
        Download Report
        </Button>
      </Box>
      </motion.div>
      
    );
  };

  const renderQASection = () => {
    const uniqueQAPairs = getUniqueQuestions(evaluation.qa_pairs || []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Question & Answer Review
          </Typography>
          <List>
            {uniqueQAPairs.map((qa, index) => (
              <React.Fragment key={index}>
                <ListItem
                  component={Paper}
                  elevation={1}
                  sx={{
                    mb: 3,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#1a237e',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <QuestionIcon /> Question {index + 1}:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        pl: 4,
                        borderLeft: '3px solid #1a237e',
                      }}
                    >
                      {qa.question}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#0d47a1',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <AnswerIcon /> Your Answer:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 1,
                        pl: 4,
                        borderLeft: '3px solid #0d47a1',
                        backgroundColor: 'rgba(13, 71, 161, 0.04)',
                        p: 2,
                        borderRadius: '0 8px 8px 0',
                      }}
                    >
                      {qa.answer}
                    </Typography>
                  </Box>
                </ListItem>
                {index < uniqueQAPairs.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </motion.div>
    );
  };

  const renderDetailedSection = () => {
    const sections = formatEvaluationSection(evaluation.detailed_evaluation);
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {sections.map((section, index) => (
          <Accordion
            key={index}
            expanded={expandedSection === index}
            onChange={() => handleExpandSection(index)}
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '8px !important',
              '&:before': {
                display: 'none',
              },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: 'rgba(26, 35, 126, 0.04)',
                borderRadius: '8px 8px 0 0',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.08)',
                },
              }}
            >
              <Typography variant="h6" sx={{ color: '#1a237e' }}>
                {section.title.split(' - ')[0]}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                {section.title.includes('Areas for Improvement') ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: '#1a237e' }}>
                      Recommended Learning Resources
                    </Typography>
                    
                    {/* Online Courses Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#0d47a1' }}>
                        Online Courses
                      </Typography>
                      <List>
                        {section.title.match(/Coursera courses:[^)]+\)/g)?.map((course, idx) => (
                          <ListItem 
                            key={idx}
                            sx={{
                              backgroundColor: 'rgba(25, 118, 210, 0.05)',
                              mb: 1,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon>
                              <School sx={{ color: '#1976d2' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={course.split('(')[0].trim()}
                              secondary={`Duration: ${course.match(/\d+ weeks/)?.[0] || 'Flexible'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
  
                    {/* Technical Resources Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#0d47a1' }}>
                        Technical Resources
                      </Typography>
                      <List>
                        {section.title.match(/Documentation links:[^)]+\)/g)?.map((resource, idx) => (
                          <ListItem 
                            key={idx}
                            sx={{
                              backgroundColor: 'rgba(25, 118, 210, 0.05)',
                              mb: 1,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <ListItemIcon>
                              <MenuBook sx={{ color: '#1976d2' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={resource.split('(')[0].trim()}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
  
                    {/* Practice Platforms Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#0d47a1' }}>
                        Practice Platforms
                      </Typography>
                      <Grid container spacing={2}>
                        {section.title.match(/Practice platforms:[^)]+\)/g)?.map((platform, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Card 
                              elevation={1}
                              sx={{
                                '&:hover': {
                                  boxShadow: 3,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                            >
                              <CardContent>
                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                  {platform.split('(')[0].trim()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {platform.match(/\([^)]+\)/)?.[0]?.replace(/[()]/g, '')}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {section.title.split(' - ').slice(1).join(' - ')}
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </motion.div>
    );
  };

  const MetricCard = ({ title, value, icon, color }) => (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          backgroundColor: color,
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {icon}
      </Box>
      <CardContent sx={{ pt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color, 
            fontWeight: 'bold',
            opacity: value > 0 ? 1 : 0.5
          }}
        >
          {value || '0.0'}
        </Typography>
      </CardContent>
    </Card>
  );

  const StatItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          backgroundColor: 'rgba(26, 35, 126, 0.1)',
          borderRadius: '50%',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon, { sx: { color: '#1a237e' } })}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Box>
  );

  const QuestionIcon = () => (
    <Box
      sx={{
        backgroundColor: 'rgba(26, 35, 126, 0.1)',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <QuestionMark sx={{ fontSize: 16, color: '#1a237e' }} />
    </Box>
  );

  const AnswerIcon = () => (
    <Box
      sx={{
        backgroundColor: 'rgba(13, 71, 161, 0.1)',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Chat sx={{ fontSize: 16, color: '#0d47a1' }} />
    </Box>
  );

  const formatContent = (content) => {
    const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
    if (content.match(linkRegex)) {
      return content.split(linkRegex).map((part, index) => {
        if (index % 3 === 1) {
          return (
            <Link
              key={index}
              href={content.match(linkRegex)[Math.floor(index / 3)][1]}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#1976D2',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {part}
            </Link>
          );
        }
        return part;
      });
    }
    return content;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        pt: { xs: 4, md: 8 },
        pb: 8,
      }}
    >
      <ToastContainer position="top-center" />
      
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
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
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
{/* Header */}
<Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{
                  mb: 2,
                  color: '#1a237e',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                  },
                }}
              >
                Back to Home
              </Button>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Interview Evaluation Report
                </Typography>
              </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {sections.map((section) => (
                  <Grid item xs={12} sm={4} key={section.id}>
                    <Button
                      fullWidth
                      variant={activeSection === section.id ? 'contained' : 'outlined'}
                      startIcon={section.icon}
                      onClick={() => handleSectionChange(section.id)}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        ...(activeSection === section.id
                          ? {
                              background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                              boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                            }
                          : {
                              color: '#1a237e',
                              borderColor: '#1a237e',
                              '&:hover': {
                                borderColor: '#0d47a1',
                                backgroundColor: 'rgba(26, 35, 126, 0.04)',
                              },
                            }),
                      }}
                    >
                      {section.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Content Section */}
            <AnimatePresence mode="wait">
              <Box sx={{ minHeight: '60vh' }}>
                {activeSection === 'summary' && renderSummarySection()}
                {activeSection === 'qa' && renderQASection()}
                {activeSection === 'detailed' && renderDetailedSection()}
              </Box>
            </AnimatePresence>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default EvaluationDetails;