import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	CheckCircle,
	Calendar,
	Users,
	Mail,
	Phone,
	ArrowLeft,
	Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Booking {
	id: number;
	guest_name: string;
	guest_email: string;
	guest_phone: string;
	check_in: string;
	check_out: string;
	num_guests: number;
	total_amount: number;
	status: string;
	special_requests: string;
	created_at: string;
}

const Confirmation: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchBooking = async () => {
			try {
				const response = await fetch(
					`https://apartment.brinkett.com.ng/api/bookings/${id}`
				);
				const data = await response.json();

				if (response.ok) {
					setBooking(data);
				} else {
					setError(data.error || "Booking not found");
				}
			} catch (error) {
				console.error("Failed to fetch booking:", error);
				setError("Failed to fetch booking details");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchBooking();
		}
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="w-8 h-8 text-red-600" />
					</div>
					<h2 className="text-xl font-bold text-gray-900 mb-2">
						Booking Not Found
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Link
						to="/"
						className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Back to Home</span>
					</Link>
				</div>
			</div>
		);
	}

	const checkInDate = parseISO(booking.check_in);
	const checkOutDate = parseISO(booking.check_out);
	const nights = Math.ceil(
		(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<style type="text/css" media="print">
				{`
					@page {
						size: auto;
						margin: 0mm;
					}
					@media print {
						header, .no-print {
							display: none !important;
						}
						body {
							-webkit-print-color-adjust: exact;
							print-color-adjust: exact;
							font-size: 12px;
						}
						.max-w-4xl {
							max-width: none;
							margin: 0;
							padding: 15px;
						}
						.grid {
							display: grid !important;
							grid-template-columns: 1fr 1fr !important;
							gap: 15px !important;
						}
						.bg-white, .bg-amber-50 {
							box-shadow: none;
							border: 1px solid #e5e7eb;
							margin-bottom: 15px;
							padding: 15px !important;
						}
						h2 { font-size: 1.5rem !important; }
						h3 { font-size: 1.2rem !important; }
						.text-3xl { font-size: 1.5rem !important; }
						.text-2xl { font-size: 1.2rem !important; }
						.text-xl { font-size: 1rem !important; }
						.mb-8 { margin-bottom: 15px !important; }
						.mb-6 { margin-bottom: 12px !important; }
						.mb-4 { margin-bottom: 8px !important; }
						.p-8 { padding: 15px !important; }
						.p-6 { padding: 12px !important; }
						.p-4 { padding: 8px !important; }
						.space-y-4 { gap: 8px !important; }
					}
				`}
			</style>
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between py-6">
						<Link
							to="/"
							className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft className="w-5 h-5" />
							<span>Back to Home</span>
						</Link>
						<h1 className="text-xl font-semibold text-gray-900">
							Booking Confirmation
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Success Message */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
					<div className="text-center">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<CheckCircle className="w-10 h-10 text-green-600" />
						</div>
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Booking Confirmed!
						</h2>
						<p className="text-lg text-gray-600 mb-6">
							Thank you for your reservation.
							{/* We've sent a
							confirmation email to{" "}
							<span className="font-semibold text-gray-900">
								{booking.guest_email}
							</span> */}
						</p>
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
							<p className="text-sm text-gray-600 mb-1">
								Booking Reference
							</p>
							<p className="text-2xl font-bold text-amber-700">
								#{booking.id.toString().padStart(6, "0")}
							</p>
						</div>
					</div>
				</div>

				{/* Booking Details */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Guest Information */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-xl font-bold text-gray-900 mb-6">
							Guest Information
						</h3>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-600 mb-1">
									Guest Name
								</p>
								<p className="font-semibold text-gray-900">
									{booking.guest_name}
								</p>
							</div>
							<div className="flex items-center space-x-3">
								<Mail className="w-4 h-4 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">
										Email
									</p>
									<p className="font-medium text-gray-900">
										{booking.guest_email}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Phone className="w-4 h-4 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">
										Phone
									</p>
									<p className="font-medium text-gray-900">
										{booking.guest_phone}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Users className="w-4 h-4 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">
										Guests
									</p>
									<p className="font-medium text-gray-900">
										{booking.num_guests} guest
										{booking.num_guests > 1 ? "s" : ""}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Stay Information */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-xl font-bold text-gray-900 mb-6">
							Stay Details
						</h3>
						<div className="space-y-4">
							<div className="flex items-center space-x-3">
								<Calendar className="w-4 h-4 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">
										Check-in
									</p>
									<p className="font-semibold text-gray-900">
										{format(
											checkInDate,
											"EEEE, MMMM d, yyyy"
										)}
									</p>
									<p className="text-sm text-gray-500">
										After 3:00 PM
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-3">
								<Calendar className="w-4 h-4 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">
										Check-out
									</p>
									<p className="font-semibold text-gray-900">
										{format(
											checkOutDate,
											"EEEE, MMMM d, yyyy"
										)}
									</p>
									<p className="text-sm text-gray-500">
										Before 11:00 AM
									</p>
								</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">
										{nights} night{nights > 1 ? "s" : ""}
									</span>
									<span className="text-xl font-bold text-amber-700">
										₦{booking.total_amount}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Special Requests */}
				{booking.special_requests && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
						<h3 className="text-xl font-bold text-gray-900 mb-4">
							Special Requests
						</h3>
						<p className="text-gray-700">
							{booking.special_requests}
						</p>
					</div>
				)}

				{/* Important Information */}
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8">
					<h3 className="text-lg font-bold text-amber-800 mb-4">
						Important Information
					</h3>
					<ul className="space-y-2 text-amber-700">
						<li>• Check-in time: 3:00 PM - 10:00 PM</li>
						<li>• Check-out time: 8:00 AM - 11:00 AM</li>
						<li>
							• Payment Details: GTBank Account 0163984462
							(Oladayo Fagbemiro)
						</li>
						<li>
							• Please send payment receipt to info@brinkett.com
						</li>
						<li>
							• Free cancellation up to 48 hours before check-in
						</li>
						<li>• Please bring a valid photo ID at check-in</li>
						<li>
							• Contact us at +234 806 688 6431 for any questions
						</li>
					</ul>
				</div>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-4 mt-8 no-print">
					<Link
						to="/"
						className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors"
					>
						Book Another Stay
					</Link>
					<button
						onClick={() => window.print()}
						className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
					>
						<Download className="w-4 h-4" />
						<span>Print Confirmation</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Confirmation;
