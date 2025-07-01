import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "luxury-apartment.db"));

export function initDatabase() {
	// Create tables
	db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS apartment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price_per_night REAL NOT NULL,
      max_guests INTEGER NOT NULL,
      amenities TEXT,
      photos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      num_guests INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'confirmed',
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Insert default admin user
	const adminExists = db
		.prepare("SELECT COUNT(*) as count FROM admins")
		.get();
	if (adminExists.count === 0) {
		const hashedPassword = bcrypt.hashSync("admin123", 10);
		db.prepare(
			"INSERT INTO admins (username, password_hash) VALUES (?, ?)"
		).run("admin", hashedPassword);
	}

	// Insert default apartment data
	const apartmentExists = db
		.prepare("SELECT COUNT(*) as count FROM apartment")
		.get();
	if (apartmentExists.count === 0) {
		const apartmentData = {
			name: "Carlton Court Apartment",
			description:
				"Experience ultimate luxury in our stunning penthouse suite featuring panoramic city views, premium amenities, and sophisticated design. This exclusive retreat offers the perfect blend of comfort and elegance for discerning guests.",
			price_per_night: 450.0,
			max_guests: 4,
			amenities: JSON.stringify([
				"King-size bed with premium linens",
				"Panoramic city views",
				"Private balcony terrace",
				"Marble bathroom with rainfall shower",
				"Fully equipped gourmet kitchen",
				"High-speed WiFi",
				"Smart TV with streaming services",
				"Air conditioning & heating",
				"Concierge service",
				"Parking space included",
			]),
			photos: JSON.stringify([
				"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
				"https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
				"https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg",
				"https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg",
			]),
		};

		db.prepare(
			`
      INSERT INTO apartment (name, description, price_per_night, max_guests, amenities, photos)
      VALUES (?, ?, ?, ?, ?, ?)
    `
		).run(
			apartmentData.name,
			apartmentData.description,
			apartmentData.price_per_night,
			apartmentData.max_guests,
			apartmentData.amenities,
			apartmentData.photos
		);
	}

	// Insert default settings
	const settingsExist = db
		.prepare("SELECT COUNT(*) as count FROM settings")
		.get();
	if (settingsExist.count === 0) {
		const defaultSettings = [
			{
				key: "terms_and_conditions",
				value: "By booking this luxury apartment, you agree to our terms and conditions including check-in/check-out times, cancellation policy, and property rules.",
			},
			{
				key: "cancellation_policy",
				value: "Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to a 50% fee.",
			},
			{ key: "check_in_time", value: "14:00" },
			{ key: "check_out_time", value: "12:00" },
		];

		const insertSetting = db.prepare(
			"INSERT INTO settings (key, value) VALUES (?, ?)"
		);
		defaultSettings.forEach((setting) => {
			insertSetting.run(setting.key, setting.value);
		});
	}

	console.log("Database initialized successfully");
}

export default db;
