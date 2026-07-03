import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useColorMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
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

  const handleSaveHotelInfo = () => {
    showSnackbar("Hotel information saved successfully!", "success");
  };

  const handleSaveTaxes = () => {
    showSnackbar("Tax settings updated successfully!", "success");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        System Settings
      </Typography>

      <Card elevation={2}>
        <Box sx={{ flexGrow: 1, display: 'flex', minHeight: 600 }}>
          {/* Vertical Tabs */}
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200, backgroundColor: 'background.paper' }}
          >
            <Tab label="Hotel Information" />
            <Tab label="Room Types" />
            <Tab label="Taxes" />
            <Tab label="Payment Methods" />
            <Tab label="User Profile" />
            <Tab label="Theme Settings" />
          </Tabs>

          {/* Hotel Information */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Hotel Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ width: 100, height: 100 }} variant="rounded">
                  Logo
                </Avatar>
                <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                  Upload Logo
                  <input hidden accept="image/*" type="file" />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Hotel Name" defaultValue="Kach Inn Hotel & Resorts" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="GST Number" defaultValue="22AAAAA0000A1Z5" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" defaultValue="+1 800 KACH INN" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email Address" defaultValue="admin@kachinn.com" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Hotel Address" defaultValue="456 Luxury Lane, Riverside, Cityville, State 12345" multiline rows={3} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSaveHotelInfo}>Save Changes</Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Room Types */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Room Types Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Manage the types of rooms available in the hotel (e.g., Single, Deluxe, Suite).
            </Typography>
            <Button variant="contained" color="primary" sx={{ mb: 3 }}>+ Add Room Type</Button>
            {/* Placeholder for Room Types List */}
            <Typography variant="body1">Currently configured: Single, Deluxe, Suite.</Typography>
          </TabPanel>

          {/* Taxes */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Tax Rates</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Default GST (%)" type="number" defaultValue={18} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Service Charge (%)" type="number" defaultValue={5} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSaveTaxes}>Update Taxes</Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Payment Methods */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Payment Methods</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="Accept Cash" />
              <FormControlLabel control={<Switch defaultChecked />} label="Accept Credit/Debit Cards" />
              <FormControlLabel control={<Switch defaultChecked />} label="Accept UPI (GPay, PhonePe)" />
              <FormControlLabel control={<Switch />} label="Accept Bank Transfers" />
            </Box>
          </TabPanel>

          {/* User Profile */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h5" fontWeight="bold" mb={3}>User Profile</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Username" value={user?.name || ''} disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Role" value={user?.role || ''} disabled sx={{ textTransform: 'capitalize' }} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" mb={2}>Change Password</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handlePasswordUpdate}>Update Password</Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Theme Settings */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Appearance</Typography>
            <Typography variant="body1" mb={2}>
              Customize the look and feel of your dashboard.
            </Typography>
            <Card variant="outlined" sx={{ p: 2, display: 'inline-block' }}>
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />}
                label={mode === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              />
            </Card>
          </TabPanel>

        </Box>
      </Card>
    </Box>
  );
};

export default Settings;
