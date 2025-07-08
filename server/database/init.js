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
    -- Migrate apartment table
    CREATE TABLE IF NOT EXISTS apartment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL DEFAULT 'Katampe, Abuja',
      price_per_night REAL NOT NULL,
      max_guests INTEGER NOT NULL,
      amenities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- New table for apartment photos
    CREATE TABLE IF NOT EXISTS apartment_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (apartment_id) REFERENCES apartment(id)
    );

    -- Update bookings with apartment reference
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      num_guests INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'confirmed',
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (apartment_id) REFERENCES apartment(id)
    );

    -- Update blocked dates with apartment reference
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apartment_id INTEGER NOT NULL,
      date DATE NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (apartment_id) REFERENCES apartment(id)
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Data migration function
    CREATE TABLE IF NOT EXISTS _migration_done (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE
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
	// Data Migration
	const migrationDone = db
		.prepare("SELECT 1 FROM _migration_done WHERE name = 'multi_apartment'")
		.get();

	if (!migrationDone) {
		console.log("Running multi-apartment migration...");

		// Start a transaction
		db.exec("BEGIN TRANSACTION;");

		try {
			// Get existing apartment data
			const existingApartment = db
				.prepare("SELECT * FROM apartment LIMIT 1")
				.get();

			if (existingApartment) {
				const photos = JSON.parse(existingApartment.photos || "[]");

				// Insert photos into new table
				const insertPhoto = db.prepare(
					"INSERT INTO apartment_photos (apartment_id, photo_url, is_primary) VALUES (?, ?, ?)"
				);

				photos.forEach((photoUrl, index) => {
					insertPhoto.run(
						existingApartment.id,
						photoUrl,
						index === 0 ? 1 : 0
					);
				});

				// Update bookings with apartment_id
				db.exec("UPDATE bookings SET apartment_id = 1");

				// Update blocked_dates with apartment_id
				db.exec("UPDATE blocked_dates SET apartment_id = 1");

				// Drop photos column from apartment table
				db.exec("ALTER TABLE apartment DROP COLUMN photos");
			}

			// Mark migration as done
			db.prepare("INSERT INTO _migration_done (name) VALUES (?)").run(
				"multi_apartment"
			);

			// Commit transaction
			db.exec("COMMIT;");
			console.log("Multi-apartment migration completed successfully");
		} catch (error) {
			// Rollback on error
			db.exec("ROLLBACK;");
			console.error("Migration failed:", error);
			throw error;
		}
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
