import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#3B2C20', // Primary Dark Brown
            light: '#7A4E2D', // Primary Brown
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#A9744F', // Light Brown
          },
          success: {
            main: '#15803D',
          },
          error: {
            main: '#DC2626',
          },
          accent: {
            main: '#1A1A1A',
          },
          ...(mode === 'light'
            ? {
                background: {
                  default: '#F7F5F2', // Background (Page)
                  paper: '#FFFFFF', // Card Background
                },
                text: {
                  primary: '#1F1F1F', // Text Primary (Headings)
                  secondary: '#6B6B6B', // Text Secondary
                },
                divider: '#E8E2DD', // Border/Divider
              }
            : {
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#FFFFFF',
                  secondary: '#A0A0A0',
                },
                divider: '#333333',
              }),
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Inter", "Poppins", "Plus Jakarta Sans", sans-serif',
          h1: { fontWeight: 700, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          h2: { fontWeight: 700, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          h3: { fontWeight: 700, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          h4: { fontWeight: 700, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          h5: { fontWeight: 700, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          h6: { fontWeight: 600, color: mode === 'light' ? '#1F1F1F' : '#fff' },
          subtitle1: { fontWeight: 600, letterSpacing: '0.015em' },
          subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
          body1: { color: mode === 'light' ? '#1F1F1F' : '#fff' },
          body2: { color: mode === 'light' ? '#6B6B6B' : '#b0b0b0' },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                height: 48,
                padding: '0 24px',
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              },
              containedPrimary: {
                backgroundColor: '#7A4E2D',
                boxShadow: '0 4px 14px 0 rgba(122, 78, 45, 0.39)',
                '&:hover': {
                  backgroundColor: '#3B2C20',
                  boxShadow: '0 6px 20px rgba(122, 78, 45, 0.23)',
                },
              }
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                height: 48,
                fontSize: '1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7A4E2D',
                },
              },
              notchedOutline: {
                borderColor: '#E8E2DD',
              }
            }
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                fontSize: '1rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }
            }
          },
          MuiSelect: {
            styleOverrides: {
              select: {
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                boxSizing: 'border-box',
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0px 2px 12px rgba(0, 0, 0, 0.06)' 
                  : '0 8px 30px rgba(0,0,0,0.3)',
                border: mode === 'light' ? 'none' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light'
                    ? '0 12px 40px rgba(0,0,0,0.08)'
                    : '0 12px 40px rgba(0,0,0,0.4)',
                }
              }
            }
          },
          MuiCardContent: {
            styleOverrides: {
              root: {
                padding: '24px',
                '&:last-child': {
                  paddingBottom: '24px',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' ? '0px 2px 12px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }
            }
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
                boxShadow: mode === 'light' ? '0 12px 40px rgba(0,0,0,0.1)' : '0 12px 40px rgba(0,0,0,0.4)',
              }
            }
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                padding: '24px 24px 16px 24px',
                fontSize: '1.25rem',
                fontWeight: 700,
              }
            }
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                padding: '24px',
              }
            }
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                padding: '16px 24px 24px 24px',
              }
            }
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' ? '0 4px 10px rgba(0,0,0,0.1)' : '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }
              }
            }
          },
          MuiBadge: {
            styleOverrides: {
              badge: {
                borderRadius: 12,
                fontWeight: 700,
              }
            }
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                fontSize: '1rem',
                boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }
            }
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.02)' : 'none',
              }
            }
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.02)',
                }
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 700,
                color: mode === 'light' ? '#6B6B6B' : '#b0b0b0',
                borderBottom: `1px solid ${mode === 'light' ? '#E8E2DD' : '#333'}`,
                padding: '16px 24px',
              },
              root: {
                borderBottom: `1px solid ${mode === 'light' ? '#E8E2DD' : '#222'}`,
                padding: '16px 24px',
                fontSize: '1rem',
              }
            }
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease, color 0.3s ease',
                backgroundColor: mode === 'light' ? '#F7F5F2' : '#121212',
              },
            },
          }
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
