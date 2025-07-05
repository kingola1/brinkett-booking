import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Calendar,
	Users,
	DollarSign,
	TrendingUp,
	Eye,
	Edit,
	Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import { format, parseISO } from "date-fns";

interface DashboardStats {
	totalBookings: number;
	upcomingBookings: number;
	totalRevenue: number;
	occupancyRate: number;
}

interface RecentBooking {
	id: number;
	guest_name: string;
	guest_email: string;
	check_in: string;
	check_out: string;
	total_amount: number;
	status: string;
	created_at: string;
}

const AdminDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/admin");
			return;
		}
		fetchDashboardData();
	}, [isAuthenticated, navigate]);

	const fetchDashboardData = async () => {
		try {
			const [statsResponse, bookingsResponse] = await Promise.all([
				fetch("https://apartment.brinkett.com.ng/api/admin/dashboard", {
					credentials: "include",
				}),
				fetch(
					"https://apartment.brinkett.com.ng/api/admin/bookings?limit=5",
					{
						credentials: "include",
					}
				),
			]);

			const statsData = await statsResponse.json();
			const bookingsData = await bookingsResponse.json();

			setStats(statsData);
			setRecentBookings(bookingsData.bookings || []);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
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
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Dashboard
					</h1>
					<p className="text-gray-600 mt-2">
						Welcome back! Here's an overview of your luxury
						apartment bookings.
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">
									Total Bookings
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{stats?.totalBookings || 0}
								</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
								<Calendar className="w-6 h-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">
									Upcoming Bookings
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{stats?.upcomingBookings || 0}
								</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<Users className="w-6 h-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">
									Total Revenue
								</p>
								<p className="text-3xl font-bold text-gray-900">
									₦{stats?.totalRevenue || 0}
								</p>
							</div>
							<div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
								<DollarSign className="w-6 h-6 text-amber-600" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">
									Occupancy Rate
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{stats?.occupancyRate || 0}%
								</p>
							</div>
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
								<TrendingUp className="w-6 h-6 text-purple-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Recent Bookings */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900">
								Recent Bookings
							</h2>
							<button
								onClick={() => navigate("/admin/bookings")}
								className="text-amber-600 hover:text-amber-700 font-medium"
							>
								View All
							</button>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
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
								{recentBookings.map((booking) => (
									<tr
										key={booking.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{booking.guest_name}
												</div>
												<div className="text-sm text-gray-500">
													{booking.guest_email}
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
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											₦{booking.total_amount}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
													booking.status
												)}`}
											>
												{booking.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center space-x-2">
												<button className="text-amber-600 hover:text-amber-700">
													<Eye className="w-4 h-4" />
												</button>
												<button className="text-blue-600 hover:text-blue-700">
													<Edit className="w-4 h-4" />
												</button>
												<button className="text-red-600 hover:text-red-700">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{recentBookings.length === 0 && (
						<div className="p-8 text-center">
							<p className="text-gray-500">No bookings found</p>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminDashboard;
