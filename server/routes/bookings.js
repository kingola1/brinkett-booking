import express from 'express';
import { format, parseISO, isAfter, isBefore, eachDayOfInterval } from 'date-fns';
import db from '../database/init.js';

const router = express.Router();

// Get available dates
router.get('/availability', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all booked dates
    const bookedDates = db.prepare(`
      SELECT check_in, check_out FROM bookings 
      WHERE status = 'confirmed' AND check_out > date('now')
    `).all();

    // Get blocked dates
    const blockedDates = db.prepare(`
      SELECT date FROM blocked_dates 
      WHERE date >= date('now')
    `).all();

    const unavailableDates = new Set();

    // Add booked date ranges
    bookedDates.forEach(booking => {
      const dates = eachDayOfInterval({
        start: parseISO(booking.check_in),
        end: parseISO(booking.check_out)
      });
      dates.forEach(date => {
        unavailableDates.add(format(date, 'yyyy-MM-dd'));
      });
    });

    // Add blocked dates
    blockedDates.forEach(blocked => {
      unavailableDates.add(blocked.date);
    });

    res.json({ unavailableDates: Array.from(unavailableDates) });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Create booking
router.post('/', (req, res) => {
  try {
    const { guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, specialRequests } = req.body;

    // Validation
    if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !numGuests) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if dates are available
    const conflictingBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE status = 'confirmed' 
      AND NOT (check_out <= ? OR check_in >= ?)
    `).get(checkIn, checkOut);

    if (conflictingBookings.count > 0) {
      return res.status(400).json({ error: 'Selected dates are not available' });
    }

    // Get apartment pricing
    const apartment = db.prepare('SELECT price_per_night FROM apartment WHERE id = 1').get();
    const checkInDate = parseISO(checkIn);
    const checkOutDate = parseISO(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * apartment.price_per_night;

    // Create booking
    const result = db.prepare(`
      INSERT INTO bookings (guest_name, guest_email, guest_phone, check_in, check_out, num_guests, total_amount, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(guestName, guestEmail, guestPhone, checkIn, checkOut, numGuests, totalAmount, specialRequests || '');

    res.json({ 
      success: true, 
      bookingId: result.lastInsertRowid,
      totalAmount,
      nights
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;