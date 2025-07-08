import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Search,
	Filter,
	Eye,
	Trash2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import { format, parseISO } from "date-fns";
import { api } from "../utils/api";

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
	apartment_id?: number;
	apartment_name?: string;
	apartment_location?: string;
}

const AdminBookings: React.FC = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	const fetchBookings = useCallback(async () => {
		setLoading(true);
		try {
			const params: Record<string, string | number | boolean> = {
				page: currentPage,
			};
			if (statusFilter !== "all") params.status = statusFilter;
			const data = await api.get("/admin/bookings", {
				credentials: "include",
				params,
			});
			setBookings(data.bookings || []);
			setTotalPages(data.totalPages || 1);
		} catch (error) {
			console.error("Failed to fetch bookings:", error);
		} finally {
			setLoading(false);
		}
	}, [currentPage, statusFilter]);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/admin");
			return;
		}
		fetchBookings();
	}, [isAuthenticated, navigate, fetchBookings]);

	const handleUpdateStatus = async (bookingId: number, status: string) => {
		try {
			await api.patch(
				`/admin/bookings/${bookingId}`,
				{ status },
				{ credentials: "include" }
			);
			fetchBookings();
		} catch (error) {
			console.error("Failed to update booking status:", error);
		}
	};

	const deleteBooking = async (bookingId: number) => {
		if (!window.confirm("Are you sure you want to delete this booking?")) {
			return;
		}

		try {
			await api.delete(`/admin/bookings/${bookingId}`, {
				credentials: "include",
			});
			fetchBookings();
		} catch (error) {
			console.error("Failed to delete booking:", error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "completed":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const filteredBookings = bookings.filter(
		(booking) =>
			booking.guest_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Bookings
						</h1>
						<p className="text-gray-600 mt-2">
							Manage all apartment reservations
						</p>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Search Bookings
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Search by guest name or email..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Status Filter
							</label>
							<div className="relative">
								<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<select
									value={statusFilter}
									onChange={(e) => {
										setStatusFilter(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								>
									<option value="all">All Bookings</option>
									<option value="confirmed">Confirmed</option>
									<option value="cancelled">Cancelled</option>
									<option value="completed">Completed</option>
								</select>
							</div>
						</div>

						<div className="flex items-end">
							<button
								onClick={fetchBookings}
								className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
							>
								Apply Filters
							</button>
						</div>
					</div>
				</div>

				{/* Bookings Table */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Booking ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Apartment
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Guest
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Check-in
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Check-out
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Guests
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Amount
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredBookings.map((booking) => (
									<tr
										key={booking.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											#
											{booking.id
												.toString()
												.padStart(6, "0")}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{booking.apartment_name || "-"}
											{booking.apartment_location ? (
												<div className="text-xs text-gray-500">
													{booking.apartment_location}
												</div>
											) : null}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{booking.guest_name}
												</div>
												<div className="text-sm text-gray-500">
													{booking.guest_email}
												</div>
												<div className="text-sm text-gray-500">
													{booking.guest_phone}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{format(
												parseISO(booking.check_in),
												"MMM d, yyyy"
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{format(
												parseISO(booking.check_out),
												"MMM d, yyyy"
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{booking.num_guests}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											₦{booking.total_amount}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<select
												value={booking.status}
												onChange={(e) =>
													handleUpdateStatus(
														booking.id,
														e.target.value
													)
												}
												className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-amber-500 ${getStatusColor(
													booking.status
												)}`}
											>
												<option value="confirmed">
													Confirmed
												</option>
												<option value="cancelled">
													Cancelled
												</option>
												<option value="completed">
													Completed
												</option>
											</select>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center space-x-2">
												<Link
													to={`/admin/bookings/${booking.id}`}
													className="text-amber-600 hover:text-amber-700 p-1"
													title="View Details"
												>
													<Eye className="w-4 h-4" />
												</Link>
												<button
													onClick={() =>
														deleteBooking(
															booking.id
														)
													}
													className="text-red-600 hover:text-red-700 p-1"
													title="Delete Booking"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredBookings.length === 0 && (
						<div className="p-8 text-center">
							<p className="text-gray-500">No bookings found</p>
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							Page {currentPage} of {totalPages}
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() =>
									setCurrentPage((prev) =>
										Math.max(prev - 1, 1)
									)
								}
								disabled={currentPage === 1}
								className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								<ChevronLeft className="w-4 h-4" />
								<span>Previous</span>
							</button>
							<button
								onClick={() =>
									setCurrentPage((prev) =>
										Math.min(prev + 1, totalPages)
									)
								}
								disabled={currentPage === totalPages}
								className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								<span>Next</span>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default AdminBookings;
