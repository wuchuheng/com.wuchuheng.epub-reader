import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string; // Optional specific path, otherwise uses browser history
  label?: string; // Optional custom label
}

/**
 * Back button component for navigation
 * Allows users to easily navigate back to the previous page
 */
export const BackButton: React.FC<BackButtonProps> = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center space-x-1 text-gray-600 transition-colors hover:text-gray-900"
      title={label}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

// Default export
export default BackButton;
