import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent, Skeleton } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { getDashboardAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MetricCard = ({ icon, label, value, secondaryText, secondaryTextColor = '#6B6B6B' }) => (
  <Card sx={{ 
    height: '100%', 
    minHeight: 140,
    borderRadius: 3, 
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)', 
    border: 'none', 
    transition: 'transform 0.2s, box-shadow 0.2s', 
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)' },
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  }}>
    <CardContent sx={{ p: { xs: 2, lg: 3 }, '&:last-child': { pb: { xs: 2, lg: 3 } }, display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, lg: 2.5 }, flexGrow: 1, minWidth: 0 }}>
      <Box sx={{ 
        width: 56, 
        height: 56, 
        borderRadius: 3, 
        bgcolor: '#F7F5F2', 
        color: '#7A4E2D', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexShrink: 0
      }}>
        {React.cloneElement(icon, { fontSize: 'large' })}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', height: '100%', minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: '#1F1F1F', fontWeight: 600, mb: 1, minHeight: 40, display: 'flex', alignItems: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F1F1F', mb: 1, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: secondaryTextColor, fontWeight: 500, minHeight: 20, display: 'flex', alignItems: 'center' }}>
          {secondaryText}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const SectionHeader = ({ title }) => (
  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F1F1F', mb: 2, mt: 4 }}>
    {title}
  </Typography>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 4 }} />
        {[1,2,3].map((section) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {[1,2,3,4].map(i => (
                <Grid item xs={12} sm={6} md={3} key={`sk1-${i}`}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  }

  if (!analytics) {
    return <Typography sx={{ p: 4 }}>Error loading analytics data.</Typography>;
  }

  const { metrics } = analytics;
  const totalRooms = (metrics.availableRooms || 0) + (metrics.occupiedRooms || 0) + (metrics.reservedRooms || 0) || 48;

  // Calculate percentages safely
  const availablePercent = totalRooms ? ((metrics.availableRooms / totalRooms) * 100).toFixed(1) : 0;
  const occupiedPercent = totalRooms ? ((metrics.occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
  const reservedPercent = totalRooms ? ((metrics.reservedRooms / totalRooms) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F7F5F2', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F1F1F', mb: 0.5 }}>
          Kach Inn Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Yash'}! Here's what's happening today.
        </Typography>
      </Box>

      {/* Row 1: Accommodation Overview */}
      <SectionHeader title="Accommodation Overview" />
      <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<HotelIcon />} 
            label="Total Rooms" 
            value={totalRooms} 
            secondaryText="All Rooms" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<CheckCircleIcon />} 
            label="Available Rooms" 
            value={metrics.availableRooms} 
            secondaryText={`${availablePercent}% Available`} 
            secondaryTextColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<MeetingRoomIcon />} 
            label="Occupied Rooms" 
            value={metrics.occupiedRooms} 
            secondaryText={`${occupiedPercent}% Occupied`} 
            secondaryTextColor="#DC2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<EventAvailableIcon />} 
            label="Reserved Rooms" 
            value={metrics.reservedRooms} 
            secondaryText={`${reservedPercent}% Reserved`} 
            secondaryTextColor="#A9744F"
          />
        </Grid>
      </Grid>

      {/* Row 2: Reception Activities */}
      <SectionHeader title="Reception Activities" />
      <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<LoginIcon />} 
            label="Today's Check-ins" 
            value={metrics.todaysCheckins} 
            secondaryText="Upcoming arrivals"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<LogoutIcon />} 
            label="Today's Check-outs" 
            value={metrics.todaysCheckouts} 
            secondaryText="Upcoming departures" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<PeopleIcon />} 
            label="Current Guests" 
            value={metrics.currentGuests} 
            secondaryText="Guests staying" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<CleaningServicesIcon />} 
            label="Housekeeping" 
            value="4" 
            secondaryText="Rooms to clean" 
          />
        </Grid>
      </Grid>

      {/* Row 3: Revenue Overview */}
      <SectionHeader title="Revenue Overview" />
      <Grid container spacing={2} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<AttachMoneyIcon />} 
            label="Revenue Today" 
            value={`₹${Number(metrics.totalRevenueToday).toLocaleString()}`} 
            secondaryText={
              <><TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} /> 18.5% vs yesterday</>
            }
            secondaryTextColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<TrendingUpIcon />} 
            label="Monthly Revenue" 
            value={`₹${Number(metrics.monthlyRevenue).toLocaleString()}`} 
            secondaryText={
              <><TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} /> 22.3% vs last month</>
            }
            secondaryTextColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<AccountBalanceWalletIcon />} 
            label="Pending Payments" 
            value={`₹${Number(metrics.pendingPayments).toLocaleString()}`} 
            secondaryText="Payments awaiting"
            secondaryTextColor="#DC2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<ReceiptIcon />} 
            label="Pending Invoices" 
            value="8" 
            secondaryText="Action required"
            secondaryTextColor="#DC2626"
          />
        </Grid>
      </Grid>

    </Box>
  );
};

export default Dashboard;
