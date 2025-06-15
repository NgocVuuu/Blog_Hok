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
    text: { primary: '#2D1B06', secondary: '#6B4F1D' }, // nâu đậm, vàng đất
    success: { main: '#4BA3A6' },
    error: { main: '#B85C38' },
    warning: { main: '#E9C46A' },
    info: { main: '#A3C9A8' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Tuffy, serif',
    h5: { fontWeight: 700, color: '#C9A063' },
    h6: { fontWeight: 600, color: '#C9A063' },
    body1: { fontSize: 16 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFDF6',
          boxShadow: '0 4px 24px #C9A06322',
          borderRadius: 16,
          border: '1.5px solid #E9C46A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          background: 'linear-gradient(90deg, #E9C46A 0%, #C9A063 100%)',
          color: '#2D1B06',
          boxShadow: '0 2px 8px #C9A06333',
          '&:hover': {
            background: 'linear-gradient(90deg, #C9A063 0%, #E9C46A 100%)',
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