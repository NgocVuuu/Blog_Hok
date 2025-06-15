import React, { createContext, useContext } from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircleRounded, ErrorRounded, WarningRounded, InfoRounded } from '@mui/icons-material';

// Create toast context
const ToastContext = createContext();

// Custom toast styles
const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
    color: 'white',
  },
  error: {
    background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
    color: 'white',
  },
  warning: {
    background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
    color: 'white',
  },
  info: {
    background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
    color: 'white',
  },
};

// Custom toast icons
const ToastIcon = ({ type }) => {
  const iconProps = {
    style: { fontSize: '20px', marginRight: '8px' }
  };

  switch (type) {
    case 'success':
      return <CheckCircleRounded {...iconProps} />;
    case 'error':
      return <ErrorRounded {...iconProps} />;
    case 'warning':
      return <WarningRounded {...iconProps} />;
    case 'info':
      return <InfoRounded {...iconProps} />;
    default:
      return null;
  }
};

// Enhanced toast functions
const createToast = (type, message, options = {}) => {
  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    icon: <ToastIcon type={type} />,
    style: toastStyles[type],
    ...options
  };

  return toast[type](message, defaultOptions);
};

// Toast service object
const toastService = {
  success: (message, options) => createToast('success', message, options),
  error: (message, options) => createToast('error', message, options),
  warning: (message, options) => createToast('warning', message, options),
  info: (message, options) => createToast('info', message, options),
  
  // Specialized toasts
  loading: (message, options) => {
    return toast.loading(message, {
      style: toastStyles.info,
      ...options
    });
  },
  
  promise: (promise, messages, options) => {
    return toast.promise(promise, {
      pending: {
        render: messages.pending || 'Loading...',
        icon: false,
        style: toastStyles.info
      },
      success: {
        render: messages.success || 'Success!',
        icon: <ToastIcon type="success" />,
        style: toastStyles.success
      },
      error: {
        render: ({ data }) => messages.error || data?.message || 'Something went wrong!',
        icon: <ToastIcon type="error" />,
        style: toastStyles.error
      }
    }, options);
  },
  
  update: (toastId, options) => toast.update(toastId, options),
  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
  
  // API response handlers
  handleApiResponse: (response, successMessage) => {
    if (response.success) {
      toastService.success(successMessage || response.message || 'Operation successful!');
    } else {
      toastService.error(response.message || 'Operation failed!');
    }
    return response;
  },
  
  handleApiError: (error) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message || 
                   'An unexpected error occurred';
    
    toastService.error(message);
    return Promise.reject(error);
  },
  
  // Form validation helpers
  validationError: (message) => {
    toastService.error(message || 'Please check your input and try again');
  },
  
  networkError: () => {
    toastService.error('Network error. Please check your connection and try again.');
  },
  
  unauthorized: () => {
    toastService.error('You are not authorized to perform this action.');
  },
  
  sessionExpired: () => {
    toastService.warning('Your session has expired. Please log in again.');
  }
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  return (
    <ToastContext.Provider value={toastService}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        theme="colored"
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        progressStyle={{
          background: 'rgba(255, 255, 255, 0.3)',
        }}
        closeButtonStyle={{
          color: 'white',
          opacity: 0.8,
        }}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
      />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// HOC for automatic error handling
export const withToastErrorHandling = (Component) => {
  const WrappedComponent = (props) => {
    const toast = useToast();
    
    const handleError = (error) => {
      toast.handleApiError(error);
    };
    
    return <Component {...props} onError={handleError} toast={toast} />;
  };
  
  WrappedComponent.displayName = `withToastErrorHandling(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default toastService;
