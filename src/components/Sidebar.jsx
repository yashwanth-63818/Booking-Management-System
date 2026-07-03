import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, useTheme, useMediaQuery, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HotelIcon from '@mui/icons-material/Hotel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BadgeIcon from '@mui/icons-material/Badge';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Bookings', icon: <EventAvailableIcon />, path: '/bookings' },
  { text: 'Rooms', icon: <HotelIcon />, path: '/rooms' },
  { text: 'Guests', icon: <PeopleIcon />, path: '/guests' },
  { text: 'Billing', icon: <ReceiptIcon />, path: '/billing' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Housekeeping', icon: <CleaningServicesIcon />, path: '/housekeeping' },
  { text: 'Staff', icon: <BadgeIcon />, path: '/staff' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#3B2C20', color: '#fff' }}>
      
      {/* Logo Section */}
      <Toolbar sx={{ justifyContent: 'flex-start', py: 3, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, height: 40, 
            border: '1px solid rgba(255,255,255,0.2)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            borderRadius: 1, 
            color: '#A9744F', 
            fontWeight: 400, 
            fontSize: 24 
          }}>
            K
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1.2 }}>
              KACH INN
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
              MANAGEMENT
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* Menu Section */}
      <List sx={{ px: 2, flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  bgcolor: isActive ? '#7A4E2D' : 'transparent',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? '#7A4E2D' : 'rgba(122, 78, 45, 0.4)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 40, opacity: 1 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 400, 
                    opacity: 1,
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>


    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
