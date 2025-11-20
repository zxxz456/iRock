import { useState } from 'react';

/*
  Custom hook to manage snackbar notifications.
  Provides functions to show and hide the snackbar,
  as well as the necessary props to pass to a Snackbar component.
*/

const useSnackbar = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const hideSnackbar = () => {
    setSnackbarOpen(false);
  };

  const snackbarProps = {
    open: snackbarOpen,
    onClose: hideSnackbar,
    message: snackbarMessage,
    severity: snackbarSeverity
  };

  return {
    showSnackbar,
    hideSnackbar,
    snackbarProps
  };
};

export default useSnackbar;