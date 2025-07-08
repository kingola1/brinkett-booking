import express from "express";
import db from "../database/init.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer setup for local uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, name);
	},
});
const upload = multer({ storage });

// Local image upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
	if (!req.file) return res.status(400).json({ error: "No file uploaded" });
	// Return the local URL (relative to server root)
	const url = `/uploads/${req.file.filename}`;
	res.json({ url });
});

// List all apartments
router.get("/", (req, res) => {
	try {
		const apartments = db
			.prepare(
				`
      SELECT a.*,
        GROUP_CONCAT(CASE WHEN ap.is_primary = 1 THEN ap.photo_url END) as primary_photo,
        GROUP_CONCAT(ap.photo_url) as all_photos
      FROM apartment a
      LEFT JOIN apartment_photos ap ON a.id = ap.apartment_id
      GROUP BY a.id
    `
			)
			.all();

		// Parse JSON fields and format response
		const formattedApartments = apartments.map((apt) => {
			let primary = apt.primary_photo;
			if (!primary && apt.all_photos) {
				// Use the first photo if no primary is set
				primary = apt.all_photos.split(",")[0] || null;
			}
			return {
				...apt,
				amenities: JSON.parse(apt.amenities || "[]"),
				primary_photo: primary || null,
			};
		});

		res.json(formattedApartments);
	} catch (error) {
		console.error("List apartments error:", error);
		res.status(500).json({ error: "Failed to fetch apartments" });
	}
});

// Get single apartment details
router.get("/:id", (req, res) => {
	try {
		const apartment = db
			.prepare(
				`
      SELECT a.*,
        json_group_array(json_object(
          'id', ap.id,
          'url', ap.photo_url,
          'is_primary', ap.is_primary
        )) as photos
      FROM apartment a
      LEFT JOIN apartment_photos ap ON a.id = ap.apartment_id
      WHERE a.id = ?
      GROUP BY a.id
    `
			)
			.get(req.params.id);

		if (!apartment) {
			return res.status(404).json({ error: "Apartment not found" });
		}

		// Parse JSON fields
		apartment.amenities = JSON.parse(apartment.amenities || "[]");
		apartment.photos = JSON.parse(apartment.photos || "[]");

		res.json(apartment);
	} catch (error) {
		console.error("Get apartment error:", error);
		res.status(500).json({ error: "Failed to fetch apartment details" });
	}
});

// Create new apartment (admin only)
router.post("/", (req, res) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}

	try {
		const {
			name,
			description,
			location,
			price_per_night,
			max_guests,
			amenities,
		} = req.body;

		const result = db
			.prepare(
				`
      INSERT INTO apartment (name, description, location, price_per_night, max_guests, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `
			)
			.run(
				name,
				description,
				location,
				price_per_night,
				max_guests,
				JSON.stringify(amenities)
			);

		res.status(201).json({
			success: true,
			apartmentId: result.lastInsertRowid,
		});
	} catch (error) {
		console.error("Create apartment error:", error);
		res.status(500).json({ error: "Failed to create apartment" });
	}
});

// Update apartment details (admin only)
router.put("/:id", (req, res) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}

	try {
		const {
			name,
			description,
			location,
			price_per_night,
			max_guests,
			amenities,
		} = req.body;

		const result = db
			.prepare(
				`
      UPDATE apartment
      SET name = ?, description = ?, location = ?, price_per_night = ?, max_guests = ?, amenities = ?
      WHERE id = ?
    `
			)
			.run(
				name,
				description,
				location,
				price_per_night,
				max_guests,
				JSON.stringify(amenities),
				req.params.id
			);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Apartment not found" });
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Update apartment error:", error);
		res.status(500).json({ error: "Failed to update apartment details" });
	}
});

// Add photo to apartment (admin only)
router.post("/:id/photos", (req, res) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}

	try {
		const { photo_url, is_primary } = req.body;

		// If setting as primary, unset any existing primary photo
		if (is_primary) {
			db.prepare(
				`
        UPDATE apartment_photos
        SET is_primary = 0
        WHERE apartment_id = ?
      `
			).run(req.params.id);
		}

		const result = db
			.prepare(
				`
      INSERT INTO apartment_photos (apartment_id, photo_url, is_primary)
      VALUES (?, ?, ?)
    `
			)
			.run(req.params.id, photo_url, is_primary ? 1 : 0);

		res.status(201).json({
			success: true,
			photoId: result.lastInsertRowid,
		});
	} catch (error) {
		console.error("Add photo error:", error);
		res.status(500).json({ error: "Failed to add photo" });
	}
});

// Delete photo (admin only)
router.delete("/:apartmentId/photos/:photoId", (req, res) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}

	try {
		const result = db
			.prepare(
				`
      DELETE FROM apartment_photos
      WHERE id = ? AND apartment_id = ?
    `
			)
			.run(req.params.photoId, req.params.apartmentId);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Photo not found" });
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Delete photo error:", error);
		res.status(500).json({ error: "Failed to delete photo" });
	}
});

// Delete apartment (admin only)
router.delete("/:id", (req, res) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}
	try {
		const { id } = req.params;
		// Delete photos first
		db.prepare("DELETE FROM apartment_photos WHERE apartment_id = ?").run(
			id
		);
		// Delete apartment
		const result = db.prepare("DELETE FROM apartment WHERE id = ?").run(id);
		if (result.changes === 0) {
			return res.status(404).json({ error: "Apartment not found" });
		}
		res.json({ success: true });
	} catch (error) {
		console.error("Delete apartment error:", error);
		res.status(500).json({ error: "Failed to delete apartment" });
	}
});

export default router;
