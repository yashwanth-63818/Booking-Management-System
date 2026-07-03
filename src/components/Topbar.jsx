import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Badge, Avatar, Box, Menu, MenuItem, Popover, List, ListItem, ListItemText, ListItemAvatar, Button, Divider, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, generateNotifications } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  backgroundColor: '#FFFFFF',
  border: `1px solid #E8E2DD`,
  '&:hover': {
    borderColor: '#7A4E2D',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: 'auto',
    minWidth: '350px'
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6B6B6B',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#1F1F1F',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    '&::placeholder': {
      color: '#6B6B6B',
      opacity: 1
    }
  },
}));

const Topbar = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Notification state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDateMenuOpen = (event) => setDateAnchorEl(event.currentTarget);
  const handleDateMenuClose = () => setDateAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNotifClick = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const handleGenerateNotifs = async () => {
    setLoadingNotifs(true);
    try {
      await generateNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to generate notifications', error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isMenuOpen = Boolean(anchorEl);
  const isNotifOpen = Boolean(notifAnchorEl);
  const isDateMenuOpen = Boolean(dateAnchorEl);
  
  return (
    <AppBar position="fixed" elevation={0} sx={{ 
      width: { md: `calc(100% - 260px)` }, 
      ml: { md: `260px` },
      bgcolor: '#FFFFFF',
      color: '#1F1F1F',
      borderBottom: '1px solid #E8E2DD'
    }}>
      <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, sm: 3 } }}>
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' }, color: '#1F1F1F' }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Center/Left: Search Bar */}
        <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search rooms, guests, bookings..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />
        
        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          
          {/* Date Filter */}
          <Button
            variant="outlined"
            onClick={handleDateMenuOpen}
            startIcon={<CalendarTodayIcon fontSize="small" sx={{ color: '#6B6B6B' }} />}
            endIcon={<KeyboardArrowDownIcon sx={{ color: '#6B6B6B' }} />}
            sx={{
              display: { xs: 'none', md: 'flex' },
              borderColor: '#E8E2DD',
              color: '#1F1F1F',
              bgcolor: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 500,
              height: 40,
              borderRadius: 2,
              '&:hover': { borderColor: '#7A4E2D', bgcolor: '#FFFFFF' }
            }}
          >
            Today
          </Button>
          <Menu
            anchorEl={dateAnchorEl}
            open={isDateMenuOpen}
            onClose={handleDateMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleDateMenuClose}>Today</MenuItem>
            <MenuItem onClick={handleDateMenuClose}>Yesterday</MenuItem>
            <MenuItem onClick={handleDateMenuClose}>This Week</MenuItem>
            <MenuItem onClick={handleDateMenuClose}>This Month</MenuItem>
          </Menu>

          {/* New Booking Button */}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              bgcolor: '#7A4E2D',
              color: '#FFFFFF',
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#3B2C20', boxShadow: 'none' }
            }}
          >
            New Booking
          </Button>

          <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center', display: { xs: 'none', sm: 'block' } }} />

          {/* Notifications */}
          <IconButton 
            aria-label="notifications" 
            onClick={handleNotifClick}
            sx={{ color: '#6B6B6B' }}
          >
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#DC2626' } }}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          
          {/* User Profile */}
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', ml: 1 }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#3B2C20', fontSize: '1rem', fontWeight: 600 }}>
              {user?.name?.charAt(0) || 'Y'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F1F1F', lineHeight: 1.2 }}>
                {user?.name || 'Yash'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'flex', alignItems: 'center' }}>
                Admin
                <KeyboardArrowDownIcon sx={{ fontSize: 14, ml: 0.5 }} />
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
      
      {/* Popovers and Menus */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>Logout</MenuItem>
      </Menu>

      <Popover
        open={isNotifOpen}
        anchorEl={notifAnchorEl}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 500, mt: 1.5, borderRadius: 3, border: '1px solid #E8E2DD', boxShadow: '0px 10px 30px rgba(0,0,0,0.1)' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E2DD' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Notifications</Typography>
          <Box>
            <Button size="small" onClick={handleGenerateNotifs} disabled={loadingNotifs} sx={{ mr: 1 }}>
              {loadingNotifs ? <CircularProgress size={16} /> : 'Scan Events'}
            </Button>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>Mark all read</Button>
            )}
          </Box>
        </Box>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#6B6B6B' }}>
              <Typography variant="body2">No notifications yet.</Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    bgcolor: notif.is_read ? 'transparent' : 'rgba(122, 78, 45, 0.05)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                  }}
                  onClick={(e) => !notif.is_read && handleMarkAsRead(notif.id, e)}
                >
                  <ListItemAvatar sx={{ mt: 1, minWidth: 40 }}>
                    <InfoIcon sx={{ color: '#7A4E2D' }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notif.is_read ? 500 : 700, color: '#1F1F1F' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" sx={{ display: 'block', mb: 0.5, color: '#6B6B6B' }}>
                          {notif.message}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ color: '#A0A0A0' }}>
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {!notif.is_read && (
                    <CircleIcon sx={{ color: '#7A4E2D', fontSize: 10, mt: 2 }} />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </AppBar>
  );
};

export default Topbar;
