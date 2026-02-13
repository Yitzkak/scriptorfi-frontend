// EditorHomePage.js - Intermediate landing page for the editor
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';

function EditorHomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/editor');
  };

  return <HomePage onStart={handleStart} />;
}

export default EditorHomePage;
