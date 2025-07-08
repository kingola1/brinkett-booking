import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../utils/api";

interface Booking {
	id: number;
	apartment_id: number;
	apartment_name?: string;
	apartment_location?: string;
	apartment_price_per_night?: number;
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

export default function AdminViewBooking() {
	const { id } = useParams<{ id: string }>();
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchBooking();
		// eslint-disable-next-line
	}, [id]);

	async function fetchBooking() {
		setLoading(true);
		setError(null);
		try {
			const data = await api.get(`/admin/bookings/${id}`, {
				credentials: "include",
			});
			setBooking(data);
		} catch {
			setError("Failed to load booking");
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
				</div>
			</AdminLayout>
		);
	}
	if (error || !booking) {
		return (
			<AdminLayout>
				<div className="text-center py-12 text-red-600">
					{error || "Booking not found"}
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="max-w-2xl mx-auto py-8">
				<h1 className="text-2xl font-bold mb-6">Booking Details</h1>
				<div className="mb-4">
					<Link
						to="/admin/bookings"
						className="text-amber-600 hover:underline"
					>
						&larr; Back to Bookings
					</Link>
				</div>
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
					<div>
						<strong>Booking ID:</strong> #{booking.id}
					</div>
					<div>
						<strong>Apartment:</strong>{" "}
						{booking.apartment_name || `#${booking.apartment_id}`}
						{booking.apartment_location ? (
							<span className="ml-2 text-gray-500">
								({booking.apartment_location})
							</span>
						) : null}
					</div>
					<div>
						<strong>Guest Name:</strong> {booking.guest_name}
					</div>
					<div>
						<strong>Email:</strong> {booking.guest_email}
					</div>
					<div>
						<strong>Phone:</strong> {booking.guest_phone}
					</div>
					<div>
						<strong>Check-in:</strong> {booking.check_in}
					</div>
					<div>
						<strong>Check-out:</strong> {booking.check_out}
					</div>
					<div>
						<strong>Guests:</strong> {booking.num_guests}
					</div>
					<div>
						<strong>Total Amount:</strong> ₦{booking.total_amount}
					</div>
					<div>
						<strong>Status:</strong> {booking.status}
					</div>
					<div>
						<strong>Special Requests:</strong>{" "}
						{booking.special_requests || "-"}
					</div>
					<div>
						<strong>Created At:</strong> {booking.created_at}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
