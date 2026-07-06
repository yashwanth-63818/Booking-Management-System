import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Tabs,
  Tab,
  Switch,
  Divider,
  Avatar,
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PhotoCamera,
  Business as BusinessIcon,
  Hotel as HotelIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  LocalAtm as CashIcon,
  AccountBalance as BankIcon,
  QrCode2 as UpiIcon,
} from '@mui/icons-material';
import { useColorMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

// Theme Colors specified by requirements
const COLORS = {
  darkBrown: '#3B2C20',
  brown: '#7A4E2D',
  white: '#FFFFFF',
  lightGray: '#F7F5F2',
  border: '#E2DCD5',
  textMuted: '#6B6056'
};

// Reusable Custom TextField to strictly separate label and input
const CustomTextField = ({ label, ...props }) => (
  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
    {label && (
      <Typography 
        variant="body2" 
        fontWeight={600} 
        sx={{ mb: 1, color: COLORS.darkBrown, letterSpacing: 0.2 }}
      >
        {label}
      </Typography>
    )}
    <TextField 
      fullWidth 
      size="medium" 
      {...props} 
      label={undefined} // Explicitly remove MUI floating label
      InputLabelProps={{ shrink: false }} // Ensure no floating label logic is active
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          bgcolor: COLORS.white,
          height: props.multiline ? 'auto' : undefined,
          alignItems: props.multiline ? 'flex-start' : 'center',
          '& fieldset': { borderColor: COLORS.border },
          '&:hover fieldset': { borderColor: COLORS.brown },
          '&.Mui-focused fieldset': { borderColor: COLORS.brown, borderWidth: '2px' },
        },
        ...props.sx
      }}
    />
  </Box>
);

// Standardized Primary Button
const PrimaryButton = ({ children, onClick, ...props }) => (
  <Button 
    variant="contained" 
    onClick={onClick}
    disableElevation
    {...props}
    sx={{ 
      bgcolor: COLORS.brown, 
      color: COLORS.white,
      '&:hover': { bgcolor: COLORS.darkBrown },
      borderRadius: '8px', 
      px: 4, 
      py: 1.5, 
      textTransform: 'none', 
      fontWeight: 600,
      fontSize: '0.95rem',
      ...props.sx
    }}
  >
    {children}
  </Button>
);

// Standardized Section Header
const SectionHeader = ({ title, description }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" fontWeight="bold" sx={{ color: COLORS.darkBrown, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
      {description}
    </Typography>
    <Divider sx={{ mt: 3, borderColor: COLORS.border }} />
  </Box>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const { mode, toggleColorMode } = useColorMode();
  const { user, changePassword } = useAuth();
  const { showSnackbar } = useUI();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showSnackbar("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showSnackbar("New passwords do not match.", "error");
      return;
    }
    
    const response = await changePassword(oldPassword, newPassword);
    if (response.success) {
      showSnackbar("Password updated successfully!", "success");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showSnackbar(response.message, "error");
    }
  };

  const handleSaveHotelInfo = () => showSnackbar("Hotel information saved successfully!", "success");
  const handleSaveTaxes = () => showSnackbar("Tax settings updated successfully!", "success");

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.lightGray, pt: 3, pb: 8, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: COLORS.darkBrown, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
            Manage your hotel configurations and system preferences.
          </Typography>
        </Box>

        {/* 2-Column Layout Container */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          
          {/* LEFT: Navigation Panel */}
          <Box sx={{ 
            width: { xs: '100%', md: 280 }, 
            flexShrink: 0
          }}>
            <Card elevation={0} sx={{ 
              bgcolor: COLORS.darkBrown, 
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
              <Tabs
                orientation={isMobile ? 'horizontal' : 'vertical'}
                variant="scrollable"
                scrollButtons="auto"
                value={tabValue}
                onChange={handleTabChange}
                sx={{ 
                  p: { xs: 0, md: 2 },
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': { 
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    textAlign: 'left', 
                    minHeight: 52,
                    px: 3,
                    mb: { xs: 0, md: 1 },
                    borderRadius: { xs: 0, md: '12px' },
                    fontWeight: 500,
                    gap: 2,
                    color: COLORS.white,
                    opacity: 0.7,
                    textTransform: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      bgcolor: 'rgba(255,255,255,0.05)'
                    },
                    '&.Mui-selected': {
                      opacity: 1,
                      color: COLORS.white,
                      bgcolor: COLORS.brown,
                      fontWeight: 600
                    }
                  } 
                }}
              >
                <Tab icon={<BusinessIcon />} label="Hotel Information" />
                <Tab icon={<HotelIcon />} label="Room Types" />
                <Tab icon={<ReceiptIcon />} label="Tax Rates" />
                <Tab icon={<CreditCardIcon />} label="Payment Methods" />
                <Tab icon={<PersonIcon />} label="User Profile" />
                <Tab icon={<PaletteIcon />} label="Appearance" />
              </Tabs>
            </Card>
          </Box>

          {/* RIGHT: Content Container */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={0} sx={{ 
              borderRadius: '16px', 
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)', 
              bgcolor: COLORS.white,
              border: `1px solid ${COLORS.border}`
            }}>
              
              {/* 1. Hotel Information */}
              <TabPanel value={tabValue} index={0}>
                <SectionHeader 
                  title="Hotel Information" 
                  description="Update your property details, logo, and primary contact information." 
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, mb: 5 }}>
                  <Avatar 
                    variant="rounded"
                    sx={{ 
                      width: 100, height: 100, 
                      bgcolor: COLORS.white,
                      border: `2px dashed ${COLORS.brown}`,
                      color: COLORS.brown,
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(122, 78, 45, 0.05)' 
                    }} 
                  >
                    <BusinessIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ 
                        borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: COLORS.brown, borderColor: COLORS.brown 
                      }}>
                        Upload New Logo
                        <input hidden accept="image/*" type="file" />
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Recommended size: 400x400px. JPG or PNG.
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Hotel Name" defaultValue="Kach Inn Hotel & Resorts" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="GST/Tax Number" defaultValue="22AAAAA0000A1Z5" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Phone Number" defaultValue="+1 800 KACH INN" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Email Address" defaultValue="admin@kachinn.com" />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField label="Hotel Address" defaultValue="456 Luxury Lane, Riverside, Cityville, State 12345" multiline minRows={3} />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3, pb: 1 }}>
                    <PrimaryButton onClick={handleSaveHotelInfo}>Save Changes</PrimaryButton>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* 2. Room Types */}
              <TabPanel value={tabValue} index={1}>
                <SectionHeader 
                  title="Room Types" 
                  description="Manage the categories of rooms available in your property." 
                />
                
                <Box mb={4} display="flex" justifyContent="flex-end">
                  <PrimaryButton sx={{ py: 1 }}>+ Add Room Type</PrimaryButton>
                </Box>
                
                <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', borderColor: COLORS.border }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.lightGray }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ width: '40%', color: COLORS.darkBrown }}>Room Type</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ width: '30%', color: COLORS.darkBrown }}>Capacity</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ width: '30%', textAlign: 'right', color: COLORS.darkBrown }}>Actions</Typography>
                  </Box>
                  {['Single', 'Deluxe', 'Suite'].map((type, idx) => (
                    <Box key={type} sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: idx < 2 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <Typography variant="body1" fontWeight="600" sx={{ width: '40%', color: COLORS.darkBrown }}>{type}</Typography>
                      <Typography variant="body1" sx={{ width: '30%', color: COLORS.textMuted }}>2 - 4 Persons</Typography>
                      <Box sx={{ width: '30%', textAlign: 'right' }}>
                        <Button size="small" sx={{ minWidth: 'auto', color: COLORS.brown, textTransform: 'none', fontWeight: 600 }}>Edit</Button>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </TabPanel>

              {/* 3. Taxes */}
              <TabPanel value={tabValue} index={2}>
                <SectionHeader 
                  title="Tax Rates" 
                  description="Configure the default tax rates applied to room bookings and services." 
                />
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Default GST (%)" type="number" defaultValue={18} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Service Charge (%)" type="number" defaultValue={5} />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.25 }}>
                    <PrimaryButton onClick={handleSaveTaxes}>Update Taxes</PrimaryButton>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* 4. Payment Methods */}
              <TabPanel value={tabValue} index={3}>
                <SectionHeader 
                  title="Payment Methods" 
                  description="Toggle the payment methods you want to accept at the property." 
                />
                
                <Box display="flex" flexDirection="column" gap={3}>
                  {[
                    { label: 'Accept Cash', icon: <CashIcon />, checked: true },
                    { label: 'Credit/Debit Cards', icon: <CreditCardIcon />, checked: true },
                    { label: 'UPI (GPay, PhonePe, Paytm)', icon: <UpiIcon />, checked: true },
                    { label: 'Bank Transfers', icon: <BankIcon />, checked: false },
                  ].map((method, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 3, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: COLORS.border }}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Box sx={{ color: COLORS.brown, display: 'flex', alignItems: 'center' }}>{method.icon}</Box>
                        <Typography fontWeight="600" fontSize="1.05rem" color={COLORS.darkBrown}>{method.label}</Typography>
                      </Box>
                      <Switch defaultChecked={method.checked} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.brown }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.brown } }} />
                    </Paper>
                  ))}
                </Box>
              </TabPanel>

              {/* 5. User Profile */}
              <TabPanel value={tabValue} index={4}>
                <SectionHeader 
                  title="User Profile" 
                  description="Manage your personal account details and security." 
                />
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Username" value={user?.name || ''} disabled />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField label="Role" value={user?.role || ''} disabled sx={{ textTransform: 'capitalize' }} />
                  </Grid>
                </Grid>
                
                <Box sx={{ my: 5 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.darkBrown, mb: 1 }}>Change Password</Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>Ensure your account is using a long, random password to stay secure.</Typography>
                  <Divider sx={{ borderColor: COLORS.border }} />
                </Box>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3.5 }}>
                    <PrimaryButton onClick={handlePasswordUpdate}>Update Password</PrimaryButton>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* 6. Theme Settings */}
              <TabPanel value={tabValue} index={5}>
                <SectionHeader 
                  title="Appearance" 
                  description="Customize the look and feel of the system interface." 
                />
                
                <Paper variant="outlined" sx={{ p: 4, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: COLORS.border }}>
                  <Box>
                    <Typography fontWeight="600" fontSize="1.05rem" color={COLORS.darkBrown} mb={1}>Dark Mode</Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                      Toggle between a light and dark color scheme.
                    </Typography>
                  </Box>
                  <Switch checked={mode === 'dark'} onChange={toggleColorMode} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.brown }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.brown } }} />
                </Paper>
              </TabPanel>

            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
