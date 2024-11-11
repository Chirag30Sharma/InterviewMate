import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Start from './pages/Start';
import Interview from './pages/Interview';
import EvaluationResults from './pages/EvaluationResults';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import EvaluationDetails from './pages/evaluationDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/start" element={<Start />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/evaluation" element={<EvaluationResults />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/evaluationDetails" element={<EvaluationDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;