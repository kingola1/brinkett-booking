import { useState, useEffect } from "react";
import { Edit, MapPin, Trash2, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import logo from "../assets/brinkett-logo.png";
import { API_BASE_URL } from "../config/api";

interface Apartment {
	id: number;
	name: string;
	description: string;
	location: string;
	price_per_night: number;
	max_guests: number;
	primary_photo: string | null;
	amenities: string[];
}

// Admin apartments list page
export function AdminApartments() {
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const location = useLocation();

	useEffect(() => {
		fetchApartments();
	}, [location]);

	async function fetchApartments() {
		setLoading(true);
		setError(null);
		try {
			const data = await api.get("/apartment", {
				credentials: "include",
			});
			setApartments(data);
		} catch {
			setError("Failed to load apartments");
		} finally {
			setLoading(false);
		}
	}

	async function handleDelete(id: number) {
		if (!window.confirm("Are you sure you want to delete this apartment?"))
			return;
		try {
			await api.delete(`/apartment/${id}`, { credentials: "include" });
			fetchApartments();
		} catch {
			setError("Failed to delete apartment");
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
			</div>
		);
	}
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center text-red-600">
				{error}
			</div>
		);
	}
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<Link
							to="/admin"
							className="flex items-center space-x-3"
						>
							<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
								<img src={logo} alt="Brinkett Logo" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Brinkett Admin
								</h1>
								<p className="text-sm text-gray-600">
									Manage Apartments
								</p>
							</div>
						</Link>
						<Link
							to="/admin/add-apartment"
							className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
						>
							Add Apartment
						</Link>
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						All Apartments
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{apartments.map((apartment) => (
						<div
							key={apartment.id}
							className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
						>
							<div className="relative h-64">
								<img
									src={
										apartment.primary_photo
											? apartment.primary_photo.startsWith(
													"/uploads/"
											  )
												? `${API_BASE_URL.replace(
														/\/api$/,
														""
												  )}${apartment.primary_photo}`
												: apartment.primary_photo
											: "https://via.placeholder.com/800x600"
									}
									alt={apartment.name}
									className="w-full h-full object-cover"
								/>
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
									<h3 className="text-xl font-bold text-white mb-2">
										{apartment.name}
									</h3>
									<div className="flex items-center space-x-4 text-white text-sm">
										<div className="flex items-center">
											<MapPin className="w-4 h-4 mr-1" />
											<span>{apartment.location}</span>
										</div>
										<div className="flex items-center">
											<Users className="w-4 h-4 mr-1" />
											<span>
												Up to {apartment.max_guests}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="p-6">
								<p className="text-gray-600 mb-4 line-clamp-2">
									{apartment.description}
								</p>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500">
											Starting from
										</p>
										<p className="text-xl font-bold text-amber-600">
											₦
											{apartment.price_per_night.toLocaleString()}
											<span className="text-sm font-normal text-gray-500">
												/night
											</span>
										</p>
									</div>
									<div className="flex space-x-2">
										<Link
											to={`/admin/edit-apartment/${apartment.id}`}
											className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
											title="Edit"
										>
											<Edit className="w-4 h-4" />
										</Link>
										<button
											onClick={() =>
												handleDelete(apartment.id)
											}
											className="inline-flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
											title="Delete"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
