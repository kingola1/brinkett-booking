import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight } from "lucide-react";
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
	photos: { url: string }[];
}

const Apartments: React.FC = () => {
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchApartments();
	}, []);

	const fetchApartments = async () => {
		try {
			const data = await api.get("/apartment");
			setApartments(data);
		} catch (error) {
			console.error("Failed to fetch apartments:", error);
			setError("Failed to load apartments. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 text-xl mb-4">{error}</p>
					<button
						onClick={() => {
							setError(null);
							setLoading(true);
							fetchApartments();
						}}
						className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<Link to="/" className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
								<img src={logo} alt="Brinkett Logo" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Brinkett
								</h1>
								<p className="text-sm text-gray-600">
									Luxury Apartments
								</p>
							</div>
						</Link>
						<Link
							to="/admin"
							className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
						>
							Admin Login
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Our Luxury Apartments
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Choose from our selection of premium apartments, each
						offering unique amenities and stunning views
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{apartments.map((apartment) => (
						<div
							key={apartment.id}
							className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="relative h-64">
								<img
									src={
										Array.isArray(apartment.photos) &&
										apartment.photos.length > 0
											? apartment.photos[0].url.startsWith(
													"/uploads/"
											  )
												? `${API_BASE_URL.replace(
														/\/api$/,
														""
												  )}${apartment.photos[0].url}`
												: apartment.photos[0].url
											: "https://via.placeholder.com/800x600"
									}
									alt={apartment.name}
									className="w-full h-full object-cover"
								/>
								{Array.isArray(apartment.photos) &&
									apartment.photos.length > 1 && (
										<div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs rounded-full px-2 py-1">
											+{apartment.photos.length - 1} more
										</div>
									)}
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
									<Link
										to={`/apartments/${apartment.id}`}
										className="inline-flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
									>
										<span>View Details</span>
										<ArrowRight className="w-4 h-4" />
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
					<p>
						&copy; {new Date().getFullYear()} Brinkett. All rights
						reserved.
					</p>
				</div>
			</footer>
		</div>
	);
};

export default Apartments;
