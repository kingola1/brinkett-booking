import express from "express";
import { format, parseISO } from "date-fns";
import db from "../database/init.js";

const router = express.Router();

// Middleware to check admin authentication
const requireAuth = (req, res, next) => {
	if (!req.session.adminId) {
		return res.status(401).json({ error: "Authentication required" });
	}
	next();
};

// Get dashboard statistics
router.get("/dashboard", requireAuth, (req, res) => {
	let totalBookings = 0;
	let upcomingBookings = 0;
	let totalRevenue = 0;
	let occupancyRate = 0;

	try {
		try {
			const totalBookingsResult = db
				.prepare("SELECT COUNT(*) as count FROM bookings")
				.get();
			totalBookings = totalBookingsResult.count;
		} catch (error) {
			throw new Error("Failed to get total bookings");
		}

		try {
			const currentDate = format(new Date(), "yyyy-MM-dd");

			const upcomingBookingsResult = db
				.prepare(
					"SELECT COUNT(*) as count FROM bookings WHERE date(check_in) >= ? AND status = 'confirmed'"
				)
				.get(currentDate);
			upcomingBookings = upcomingBookingsResult.count;
		} catch (error) {
			throw new Error("Failed to get upcoming bookings");
		}

		try {
			const revenueResult = db
				.prepare(
					"SELECT SUM(total_amount) as total FROM bookings WHERE status = 'completed'"
				)
				.get();
			totalRevenue = revenueResult.total || 0;
		} catch (error) {
			throw new Error("Failed to get total revenue");
		}

		try {
			const currentMonth = format(new Date(), "yyyy-MM");
			const daysInMonth = new Date(
				new Date().getFullYear(),
				new Date().getMonth() + 1,
				0
			).getDate();

			const bookedDaysResult = db
				.prepare(
					"SELECT COUNT(*) as count FROM bookings WHERE strftime('%Y-%m', check_in) = ? AND status = 'confirmed'"
				)
				.get(currentMonth);

			const bookedDays = bookedDaysResult.count;
			occupancyRate = Math.round((bookedDays / daysInMonth) * 100);
		} catch (error) {
			throw new Error("Failed to calculate occupancy rate");
		}

		// Send response with all stats
		const response = {
			totalBookings,
			upcomingBookings,
			totalRevenue,
			occupancyRate,
		};
		res.json(response);
	} catch (error) {
		// Always return a valid stats object, even if there was an error
		const response = {
			totalBookings: parseInt(totalBookings) || 0,
			upcomingBookings: parseInt(upcomingBookings) || 0,
			totalRevenue: parseFloat(totalRevenue) || 0,
			occupancyRate: parseInt(occupancyRate) || 0,
		};

		// Send a 200 response with default values instead of error
		res.json(response);
	}
});

// Get all bookings
router.get("/bookings", requireAuth, (req, res) => {
	try {
		const { status, page = 1, limit = 10 } = req.query;
		let query = `SELECT b.*, a.name as apartment_name, a.location as apartment_location, a.price_per_night as apartment_price_per_night FROM bookings b LEFT JOIN apartment a ON b.apartment_id = a.id`;
		let params = [];

		if (status && status !== "all") {
			query += " WHERE b.status = ?";
			params.push(status);
		}

		query += " ORDER BY b.created_at DESC";

		if (limit !== "all") {
			const offset = (page - 1) * limit;
			query += " LIMIT ? OFFSET ?";
			params.push(parseInt(limit), offset);
		}

		const bookings = db.prepare(query).all(...params);
		const totalCount = db
			.prepare(
				"SELECT COUNT(*) as count FROM bookings" +
					(status && status !== "all" ? " WHERE status = ?" : "")
			)
			.get(...(status && status !== "all" ? [status] : [])).count;

		res.json({
			bookings,
			totalCount,
			currentPage: parseInt(page),
			totalPages: limit === "all" ? 1 : Math.ceil(totalCount / limit),
		});
	} catch (error) {
		console.error("Get bookings error:", error);
		res.status(500).json({ error: "Failed to fetch bookings" });
	}
});

// Get single booking by id
router.get("/bookings/:id", requireAuth, (req, res) => {
	try {
		const { id } = req.params;
		const booking = db
			.prepare(
				`SELECT b.*, a.name as apartment_name, a.location as apartment_location, a.price_per_night as apartment_price_per_night FROM bookings b LEFT JOIN apartment a ON b.apartment_id = a.id WHERE b.id = ?`
			)
			.get(id);
		if (!booking) {
			return res.status(404).json({ error: "Booking not found" });
		}
		res.json(booking);
	} catch (error) {
		console.error("Get booking by id error:", error);
		res.status(500).json({ error: "Failed to fetch booking" });
	}
});

// Update booking status
router.put("/bookings/:id", requireAuth, (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!["confirmed", "cancelled", "completed"].includes(status)) {
			return res.status(400).json({ error: "Invalid status" });
		}

		const result = db
			.prepare("UPDATE bookings SET status = ? WHERE id = ?")
			.run(status, id);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Booking not found" });
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Update booking error:", error);
		res.status(500).json({ error: "Failed to update booking" });
	}
});

// Delete booking
router.delete("/bookings/:id", requireAuth, (req, res) => {
	try {
		const { id } = req.params;
		const result = db.prepare("DELETE FROM bookings WHERE id = ?").run(id);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Booking not found" });
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Delete booking error:", error);
		res.status(500).json({ error: "Failed to delete booking" });
	}
});

// Add blocked date
router.post("/blocked-dates", requireAuth, (req, res) => {
	try {
		const { date, reason } = req.body;

		if (!date) {
			return res.status(400).json({ error: "Date is required" });
		}

		db.prepare(
			"INSERT INTO blocked_dates (date, reason) VALUES (?, ?)"
		).run(date, reason || "Maintenance");
		res.json({ success: true });
	} catch (error) {
		console.error("Add blocked date error:", error);
		res.status(500).json({ error: "Failed to add blocked date" });
	}
});

// Get blocked dates
router.get("/blocked-dates", requireAuth, (req, res) => {
	try {
		const blockedDates = db
			.prepare("SELECT * FROM blocked_dates ORDER BY date")
			.all();
		res.json(blockedDates);
	} catch (error) {
		console.error("Get blocked dates error:", error);
		res.status(500).json({ error: "Failed to fetch blocked dates" });
	}
});

// Remove blocked date
router.delete("/blocked-dates/:id", requireAuth, (req, res) => {
	try {
		const { id } = req.params;
		const result = db
			.prepare("DELETE FROM blocked_dates WHERE id = ?")
			.run(id);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Blocked date not found" });
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Remove blocked date error:", error);
		res.status(500).json({ error: "Failed to remove blocked date" });
	}
});

// GET /admin/settings - fetch the first apartment's settings
router.get("/settings", requireAuth, (req, res) => {
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
			GROUP BY a.id
			LIMIT 1
		`
			)
			.get();
		if (!apartment) {
			return res.status(404).json({ error: "No apartment found" });
		}
		apartment.amenities = JSON.parse(apartment.amenities || "[]");
		apartment.photos = JSON.parse(apartment.photos || "[]");
		res.json(apartment);
	} catch (error) {
		console.error("Get settings error:", error);
		res.status(500).json({ error: "Failed to fetch settings" });
	}
});

// PUT /admin/settings - update the first apartment's settings
router.put("/settings", requireAuth, (req, res) => {
	try {
		const {
			name,
			description,
			location,
			price_per_night,
			max_guests,
			amenities,
		} = req.body;
		// Get the first apartment's id
		const apartment = db.prepare("SELECT id FROM apartment LIMIT 1").get();
		if (!apartment) {
			return res.status(404).json({ error: "No apartment found" });
		}
		db.prepare(
			`
			UPDATE apartment
			SET name = ?, description = ?, location = ?, price_per_night = ?, max_guests = ?, amenities = ?
			WHERE id = ?
		`
		).run(
			name,
			description,
			location,
			price_per_night,
			max_guests,
			JSON.stringify(amenities),
			apartment.id
		);
		res.json({ success: true });
	} catch (error) {
		console.error("Update settings error:", error);
		res.status(500).json({ error: "Failed to update settings" });
	}
});

// GET /admin/global-settings - fetch all global settings
router.get("/global-settings", requireAuth, (req, res) => {
	try {
		const settings = db.prepare("SELECT key, value FROM settings").all();
		const result = {};
		settings.forEach((s) => {
			result[s.key] = s.value;
		});
		res.json(result);
	} catch (error) {
		console.error("Get global settings error:", error);
		res.status(500).json({ error: "Failed to fetch settings" });
	}
});

// PUT /admin/global-settings - update global settings
router.put("/global-settings", requireAuth, (req, res) => {
	try {
		const updates = req.body;
		const stmt = db.prepare("UPDATE settings SET value = ? WHERE key = ?");
		for (const key in updates) {
			stmt.run(updates[key], key);
		}
		res.json({ success: true });
	} catch (error) {
		console.error("Update global settings error:", error);
		res.status(500).json({ error: "Failed to update settings" });
	}
});

// GET /admin/calendar - bookings and blocked dates for calendar view
router.get("/calendar", requireAuth, (req, res) => {
	try {
		const now = new Date();
		const month = req.query.month
			? parseInt(req.query.month)
			: now.getMonth() + 1;
		const year = req.query.year
			? parseInt(req.query.year)
			: now.getFullYear();
		const monthStr = month.toString().padStart(2, "0");
		const start = `${year}-${monthStr}-01`;
		const end = `${year}-${monthStr}-31`;
		const bookings = db
			.prepare(
				`SELECT id, guest_name, check_in, check_out, status FROM bookings WHERE check_in <= ? AND check_out >= ?`
			)
			.all(end, start);
		const blockedDates = db
			.prepare(
				`SELECT id, date, reason FROM blocked_dates WHERE date >= ? AND date <= ?`
			)
			.all(start, end);
		res.json({ bookings, blockedDates });
	} catch (error) {
		console.error("Calendar fetch error:", error);
		res.status(500).json({ error: "Failed to fetch calendar data" });
	}
});

export default router;
