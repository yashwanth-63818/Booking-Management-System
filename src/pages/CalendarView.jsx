import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDropDefault from 'react-big-calendar/lib/addons/dragAndDrop';
const withDragAndDrop = withDragAndDropDefault.default || withDragAndDropDefault;

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { bookingsData } from '../services/dummyData';
import { useUI } from '../context/UIContext';

// Setup localizer for date-fns
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

const CalendarView = () => {
  const { showDialog, showSnackbar } = useUI();

  // Map backend bookings to calendar events
  const initialEvents = useMemo(() => {
    return bookingsData.map(booking => ({
      id: booking.id,
      title: `Room ${booking.room} - ${booking.customerName}`,
      start: new Date(booking.checkIn),
      end: new Date(booking.checkOut),
      allDay: true,
      resource: booking,
    }));
  }, []);

  const [events, setEvents] = useState(initialEvents);

  // Custom event styling based on booking status
  const eventPropGetter = useCallback((event) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad'; // Default blue

    if (status === 'Confirmed') backgroundColor = '#4caf50'; // Green
    if (status === 'Checked In') backgroundColor = '#ff9800'; // Orange
    if (status === 'Pending') backgroundColor = '#9c27b0'; // Purple
    if (status === 'Checked Out') backgroundColor = '#9e9e9e'; // Grey

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  }, []);

  // Handle clicking on a booking
  const handleSelectEvent = useCallback((event) => {
    const b = event.resource;
    const content = (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" gutterBottom><strong>Customer:</strong> {b.customerName}</Typography>
        <Typography variant="body1" gutterBottom><strong>Contact:</strong> {b.phone} | {b.email}</Typography>
        <Typography variant="body1" gutterBottom><strong>Dates:</strong> {b.checkIn} to {b.checkOut}</Typography>
        <Typography variant="body1" gutterBottom><strong>Room:</strong> {b.room}</Typography>
        <Typography variant="body1" gutterBottom><strong>Guests:</strong> {b.guests}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Status:</strong> <Chip size="small" label={b.status} color="primary" />
        </Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">Total: ${b.grandTotal}</Typography>
      </Box>
    );

    showDialog({
      title: `Booking Details - ${b.id}`,
      content: content,
      confirmText: 'Close',
      cancelText: 'Edit Booking',
      onConfirm: () => {}, 
    });
  }, [showDialog]);

  // Handle Drag and Drop
  const moveEvent = useCallback(({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    const idx = events.indexOf(event);
    const updatedEvent = { ...event, start, end, allDay: droppedOnAllDaySlot };

    const nextEvents = [...events];
    nextEvents.splice(idx, 1, updatedEvent);

    setEvents(nextEvents);
    
    // In a real app, you would make an API call here to update the backend dates
    showSnackbar(`Booking for ${event.resource.customerName} moved to ${format(start, 'MMM dd')}`, 'success');
  }, [events, showSnackbar]);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Booking Calendar
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          onEventDrop={moveEvent}
          resizable={false} // Keeping it simple for phase 13, just drag and drop
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          selectable
        />
      </Paper>
    </Box>
  );
};

export default CalendarView;
