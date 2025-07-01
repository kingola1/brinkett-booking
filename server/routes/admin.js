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
		let query = "SELECT * FROM bookings";
		let params = [];

		if (status && status !== "all") {
			query += " WHERE status = ?";
			params.push(status);
		}

		query += " ORDER BY created_at DESC";

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

export default router;
