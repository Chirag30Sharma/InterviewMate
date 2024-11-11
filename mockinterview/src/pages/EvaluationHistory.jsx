import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Color } from 'three';

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
        console.log('Fetched data:', data); // Debug log
        setEvaluations(data);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err); // Debug log
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
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to safely format the score
  const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return Number(score).toFixed(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading evaluations: {error}</div>;
  }

  const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const cardGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

const scoreStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'black'
};

  const dateStyle = {
    color: '#666',
    marginBottom: '15px'
  };

  const buttonStyle = {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <h2>Your Interview Evaluations</h2>
      <div style={cardGridStyle}>
        {evaluations && evaluations.map((evaluation, index) => (
          <div key={index} style={cardStyle}>
            <div style={scoreStyle}>
              Score: {formatScore(evaluation?.average_score)}
            </div>
            <div style={dateStyle}>
              Date: {formatDate(evaluation?.createdAt)}
            </div>
            <button 
                style={buttonStyle}
                onClick={() => navigate(`/evaluationDetails`, { state: { evaluation } })}
                >
                Read More
            </button>
          </div>
        ))}
      </div>
      {(!evaluations || evaluations.length === 0) && (
        <div>No evaluations found. Start your first interview to see results here!</div>
      )}
    </div>
  );
};

export default EvaluationHistory;