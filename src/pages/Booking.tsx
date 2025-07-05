import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Users,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
	MapPin,
	Star,
} from "lucide-react";
import {
	format,
	addDays,
	differenceInDays,
	parseISO,
	isBefore,
} from "date-fns";

interface Apartment {
	id: number;
	name: string;
	price_per_night: number;
	max_guests: number;
	photos: string[];
}

interface BookingForm {
	guestName: string;
	guestEmail: string;
	guestPhone: string;
	checkIn: string;
	checkOut: string;
	numGuests: number;
	specialRequests: string;
}

const Booking: React.FC = () => {
	const navigate = useNavigate();
	const [apartment, setApartment] = useState<Apartment | null>(null);
	const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
	const [form, setForm] = useState<BookingForm>({
		guestName: "",
		guestEmail: "",
		guestPhone: "",
		checkIn: "",
		checkOut: "",
		numGuests: 1,
		specialRequests: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);

	useEffect(() => {
		fetchApartmentDetails();
		fetchAvailability();
	}, []);

	const fetchApartmentDetails = async () => {
		try {
			const response = await fetch(
				"https://apartment.brinkett.com.ng/api/apartment"
			);
			const data = await response.json();
			setApartment(data);
		} catch (error) {
			console.error("Failed to fetch apartment details:", error);
		}
	};

	const fetchAvailability = async () => {
		try {
			const response = await fetch(
				"https://apartment.brinkett.com.ng/api/bookings/availability"
			);
			const data = await response.json();
			setUnavailableDates(data.unavailableDates || []);
		} catch (error) {
			console.error("Failed to fetch availability:", error);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
		setError("");
	};

	const isDateUnavailable = (date: string) => {
		return unavailableDates.includes(date);
	};

	const validateDates = () => {
		if (!form.checkIn || !form.checkOut) return false;

		const checkInDate = parseISO(form.checkIn);
		const checkOutDate = parseISO(form.checkOut);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (isBefore(checkInDate, today)) {
			setError("Check-in date cannot be in the past");
			return false;
		}

		if (isBefore(checkOutDate, addDays(checkInDate, 1))) {
			setError("Check-out date must be at least one day after check-in");
			return false;
		}

		// Check if any date in the range is unavailable
		let currentDate = checkInDate;
		while (isBefore(currentDate, checkOutDate)) {
			if (isDateUnavailable(format(currentDate, "yyyy-MM-dd"))) {
				setError("Selected dates are not available");
				return false;
			}
			currentDate = addDays(currentDate, 1);
		}

		return true;
	};

	const calculateTotal = () => {
		if (!apartment || !form.checkIn || !form.checkOut) return 0;

		const checkInDate = parseISO(form.checkIn);
		const checkOutDate = parseISO(form.checkOut);
		const nights = differenceInDays(checkOutDate, checkInDate);

		return nights * apartment.price_per_night;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!termsAccepted) {
			setError("Please accept the terms and conditions");
			return;
		}

		if (!validateDates()) return;

		setLoading(true);
		setError("");

		try {
			const response = await fetch(
				"https://apartment.brinkett.com.ng/api/bookings",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(form),
				}
			);

			const data = await response.json();

			if (data.success) {
				navigate(`/confirmation/${data.bookingId}`);
			} else {
				setError(data.error || "Failed to create booking");
			}
		} catch (error) {
			setError("Failed to create booking. Please try again.");
			console.error("Booking error:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!apartment) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
			</div>
		);
	}

	const nights =
		form.checkIn && form.checkOut
			? differenceInDays(parseISO(form.checkOut), parseISO(form.checkIn))
			: 0;
	const total = calculateTotal();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<Link
							to="/"
							className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft className="w-5 h-5" />
							<span>Back to Home</span>
						</Link>
						<h1 className="text-xl font-semibold text-gray-900">
							Book Your Stay
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Property Info */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
						<div className="aspect-video overflow-hidden">
							<img
								src={apartment.photos[0]}
								alt={apartment.name}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="p-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								{apartment.name}
							</h2>
							<div className="flex items-center space-x-4 text-gray-600 mb-4">
								<div className="flex items-center space-x-1">
									<Star className="w-4 h-4 text-amber-400 fill-current" />
									<span className="text-sm">5.0 Rating</span>
								</div>
								<div className="flex items-center space-x-1">
									<Users className="w-4 h-4" />
									<span className="text-sm">
										Up to {apartment.max_guests} guests
									</span>
								</div>
								<div className="flex items-center space-x-1">
									<MapPin className="w-4 h-4" />
									<span className="text-sm">
										Prime Location
									</span>
								</div>
							</div>
							<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">
											Price per night
										</p>
										<p className="text-2xl font-bold text-amber-700">
											₦{apartment.price_per_night}
										</p>
									</div>
									{nights > 0 && (
										<div className="text-right">
											<p className="text-sm text-gray-600">
												{nights} night
												{nights > 1 ? "s" : ""}
											</p>
											<p className="text-xl font-bold text-gray-900">
												₦{total}
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Booking Form */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-xl font-bold text-gray-900 mb-6">
							Complete Your Reservation
						</h3>

						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
								<AlertCircle className="w-5 h-5 text-red-500" />
								<span className="text-red-700">{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Guest Information */}
							<div className="space-y-4">
								<h4 className="font-semibold text-gray-900">
									Guest Information
								</h4>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Full Name *
									</label>
									<input
										type="text"
										name="guestName"
										value={form.guestName}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										placeholder="Enter your full name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email Address *
									</label>
									<input
										type="email"
										name="guestEmail"
										value={form.guestEmail}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										placeholder="Enter your email"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone Number *
									</label>
									<input
										type="tel"
										name="guestPhone"
										value={form.guestPhone}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										placeholder="Enter your phone number"
									/>
								</div>
							</div>

							{/* Stay Details */}
							<div className="space-y-4">
								<h4 className="font-semibold text-gray-900">
									Stay Details
								</h4>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Check-in Date *
										</label>
										<input
											type="date"
											name="checkIn"
											value={form.checkIn}
											onChange={handleInputChange}
											required
											min={format(
												new Date(),
												"yyyy-MM-dd"
											)}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Check-out Date *
										</label>
										<input
											type="date"
											name="checkOut"
											value={form.checkOut}
											onChange={handleInputChange}
											required
											min={
												form.checkIn
													? format(
															addDays(
																parseISO(
																	form.checkIn
																),
																1
															),
															"yyyy-MM-dd"
													  )
													: format(
															addDays(
																new Date(),
																1
															),
															"yyyy-MM-dd"
													  )
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Number of Guests *
									</label>
									<select
										name="numGuests"
										value={form.numGuests}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
									>
										{Array.from(
											{ length: apartment.max_guests },
											(_, i) => i + 1
										).map((num) => (
											<option key={num} value={num}>
												{num} guest{num > 1 ? "s" : ""}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Special Requests
									</label>
									<textarea
										name="specialRequests"
										value={form.specialRequests}
										onChange={handleInputChange}
										rows={3}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										placeholder="Any special requests or requirements?"
									/>
								</div>
							</div>

							{/* Terms and Conditions */}
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<input
										type="checkbox"
										id="terms"
										checked={termsAccepted}
										onChange={(e) =>
											setTermsAccepted(e.target.checked)
										}
										className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
									/>
									<label
										htmlFor="terms"
										className="text-sm text-gray-700"
									>
										I agree to the terms and conditions,
										including the cancellation policy. Free
										cancellation up to 48 hours before
										check-in.
									</label>
								</div>
							</div>

							{/* Total and Submit */}
							{nights > 0 && (
								<div className="bg-gray-50 p-4 rounded-lg">
									<div className="flex justify-between items-center mb-2">
										<span className="text-gray-600">
											₦{apartment.price_per_night} ×{" "}
											{nights} night
											{nights > 1 ? "s" : ""}
										</span>
										<span className="font-semibold">
											₦{total}
										</span>
									</div>
									<div className="border-t pt-2">
										<div className="flex justify-between items-center font-bold text-lg">
											<span>Total</span>
											<span className="text-amber-700">
												₦{total}
											</span>
										</div>
									</div>
								</div>
							)}

							<button
								type="submit"
								disabled={loading || !termsAccepted}
								className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
							>
								{loading ? (
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
								) : (
									<>
										<CheckCircle className="w-5 h-5" />
										<span>Confirm Reservation</span>
									</>
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Booking;
