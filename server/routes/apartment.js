import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Get apartment details
router.get('/', (req, res) => {
  try {
    const apartment = db.prepare('SELECT * FROM apartment WHERE id = 1').get();
    
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Parse JSON fields
    apartment.amenities = JSON.parse(apartment.amenities || '[]');
    apartment.photos = JSON.parse(apartment.photos || '[]');

    res.json(apartment);
  } catch (error) {
    console.error('Get apartment error:', error);
    res.status(500).json({ error: 'Failed to fetch apartment details' });
  }
});

// Update apartment details (admin only)
router.put('/', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { name, description, price_per_night, max_guests, amenities, photos } = req.body;

    const result = db.prepare(`
      UPDATE apartment 
      SET name = ?, description = ?, price_per_night = ?, max_guests = ?, amenities = ?, photos = ?
      WHERE id = 1
    `).run(
      name,
      description,
      price_per_night,
      max_guests,
      JSON.stringify(amenities),
      JSON.stringify(photos)
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update apartment error:', error);
    res.status(500).json({ error: 'Failed to update apartment details' });
  }
});

export default router;