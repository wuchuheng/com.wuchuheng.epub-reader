import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppDispatch } from './store';
import { loadSettings } from './store/slices/settingsSlice';
import { useGlobalFont } from './hooks/useGlobalFont';
import router from './config/router';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Apply global font settings
  useGlobalFont();

  useEffect(() => {
    // Load initial settings from OPFS
    dispatch(loadSettings());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
