import express from "express";
import cors from "cors";
import session from "cookie-session";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initDatabase } from "./database/init.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import apartmentRoutes from "./routes/apartment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDatabase();

// Middleware
app.use(
	cors({
		origin: ["http://localhost:5173", "https://apartment.brinkett.com.ng"],
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: "luxury-apartment-booking-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // Set to true in production with HTTPS
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	})
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/apartment", apartmentRoutes);

// Static files
app.use("/uploads", express.static(join(__dirname, "uploads")));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
