import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F8F5EC', // nền giấy sáng
      paper: '#FFFDF6',   // card sáng hơn
    },
    primary: { main: '#C9A063' }, // vàng đất/kim
    secondary: { main: '#4BA3A6' }, // xanh ngọc
  text: { primary: '#2D1B06', secondary: '#222' }, // nâu đậm, màu đậm hơn cho secondary
    success: { main: '#4BA3A6' },
    error: { main: '#B85C38' },
    warning: { main: '#E9C46A' },
    info: { main: '#A3C9A8' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Tuffy, serif',
  h5: { fontWeight: 700, color: '#2D1B06' },
  h6: { fontWeight: 600, color: '#2D1B06' },
  body2: { color: '#2D1B06' },
    body1: { fontSize: 16 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFDF6',
          // Softer elevation and border to avoid heavy visual separators between cards
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          // Subtle background to reduce heavy accent bars
          background: 'linear-gradient(90deg, #F1E7C9 0%, #E6D3A8 100%)',
          color: '#2D1B06',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          '&:hover': {
            background: 'linear-gradient(90deg, #E9C46A 0%, #C9A063 100%)',
            color: '#fff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#FFFDF6',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: '#F8F5EC',
          borderRadius: 8,
        },
        input: {
          color: '#2D1B06',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#C9A063',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#2D1B06',
        },
      },
    },
  },
});

export default theme;