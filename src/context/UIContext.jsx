import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';

const UIContext = createContext(null);

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'info', 'warning'
  });

  // Dialog State
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  useEffect(() => {
    const handleApiError = (event) => {
      const { type, message } = event.detail;
      if (type === 'network') {
        setSnackbar({ open: true, message, severity: 'error' });
      } else if (type === 'server') {
        // We could redirect to /500, but a toast is less disruptive unless it's a fatal crash.
        // Let's redirect if it's a 500.
        window.location.href = '/500';
      } else if (type === 'client') {
        setSnackbar({ open: true, message, severity: 'error' });
      }
    };
    window.addEventListener('api-error', handleApiError);
    return () => window.removeEventListener('api-error', handleApiError);
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const hideSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const showDialog = useCallback(({ title, content, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    setDialog({
      open: true,
      title,
      content,
      onConfirm,
      confirmText,
      cancelText
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDialogConfirm = useCallback(() => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    hideDialog();
  }, [dialog, hideDialog]);

  return (
    <UIContext.Provider value={{ showSnackbar, showDialog }}>
      {children}
      
      {/* Global Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Confirmation Dialog */}
      <Dialog open={dialog.open} onClose={hideDialog} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight="bold">{dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={hideDialog} color="inherit">{dialog.cancelText}</Button>
          <Button onClick={handleDialogConfirm} color="primary" variant="contained" disableElevation>
            {dialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </UIContext.Provider>
  );
};
