import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
	MapPin,
	Wifi,
	Car,
	Utensils,
	Bath,
	Bed,
	Users,
	Star,
	Calendar,
	ArrowRight,
} from "lucide-react";
import logo from "../assets/brinkett-logo.png"; // Adjust the path as necessary
interface Apartment {
	id: number;
	name: string;
	description: string;
	price_per_night: number;
	max_guests: number;
	amenities: string[];
	photos: string[];
}

const Home: React.FC = () => {
	const [apartment, setApartment] = useState<Apartment | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [touchStart, setTouchStart] = useState<number | null>(null);

	const nextImage = useCallback(() => {
		if (apartment) {
			setCurrentImageIndex(
				(prev) => (prev + 1) % apartment.photos.length
			);
		}
	}, [apartment, currentImageIndex]);

	const prevImage = useCallback(() => {
		if (apartment) {
			setCurrentImageIndex(
				(prev) =>
					(prev - 1 + apartment.photos.length) %
					apartment.photos.length
			);
		}
	}, [apartment, currentImageIndex]);

	useEffect(() => {
		fetchApartmentDetails();
	}, []);

	// Auto-play functionality
	useEffect(() => {
		if (!apartment || isPaused) return;

		const interval = setInterval(nextImage, 5000); // Change image every 5 seconds

		return () => clearInterval(interval);
	}, [apartment, isPaused, nextImage]);

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

	if (!apartment) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			{/* Header */}
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
								<img src={logo} alt="Brinkett Logo" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Brinkett
								</h1>
								<p className="text-sm text-gray-600">
									Management & Property Agency
								</p>
							</div>
						</div>
						<Link
							to="/admin"
							className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
						>
							Admin Login
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative">
				<div
					className="relative h-96 md:h-[500px] overflow-hidden"
					onMouseEnter={() => setIsPaused(true)}
					onMouseLeave={() => setIsPaused(false)}
					onTouchStart={(e) => {
						setIsPaused(true);
						setTouchStart(e.touches[0].clientX);
					}}
					onTouchMove={(e) => {
						if (touchStart === null || !apartment) return;

						const currentTouch = e.touches[0].clientX;
						const diff = touchStart - currentTouch;

						// Threshold of 50px for swipe
						if (Math.abs(diff) > 50) {
							if (diff > 0) {
								nextImage();
							} else {
								prevImage();
							}
							setTouchStart(null);
						}
					}}
					onTouchEnd={() => {
						setIsPaused(false);
						setTouchStart(null);
					}}
				>
					<img
						src={apartment.photos[currentImageIndex]}
						alt={apartment.name}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

					{/* Image Navigation */}
					<button
						onClick={prevImage}
						className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all z-20 cursor-pointer"
					>
						<ArrowRight className="w-5 h-5 text-gray-800 rotate-180" />
					</button>
					<button
						onClick={nextImage}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all z-20 cursor-pointer"
					>
						<ArrowRight className="w-5 h-5 text-gray-800" />
					</button>

					{/* Hero Content */}
					<div className="absolute inset-0 flex items-center justify-center z-10">
						<div className="text-center text-white max-w-4xl px-4 relative z-20">
							<h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
								{apartment.name}
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
								Experience ultimate luxury with breathtaking
								views and premium amenities
							</p>
							<div className="flex items-center justify-center space-x-6 mb-8">
								<div className="flex items-center space-x-2">
									<Star className="w-5 h-5 text-amber-400 fill-current" />
									<span className="font-semibold">
										5.0 Rating
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users className="w-5 h-5" />
									<span>
										Up to {apartment.max_guests} guests
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<MapPin className="w-5 h-5" />
									<span>Kado, Abuja</span>
								</div>
							</div>
							<Link
								to="/booking"
								className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
							>
								<Calendar className="w-5 h-5" />
								<span>Book Now</span>
							</Link>
						</div>
					</div>
				</div>

				{/* Image Indicators */}
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
					{apartment.photos.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentImageIndex(index)}
							className={`w-3 h-3 rounded-full transition-all ${
								index === currentImageIndex
									? "bg-white"
									: "bg-white bg-opacity-50"
							}`}
						/>
					))}
				</div>
			</section>

			{/* Details Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 mb-6">
								Luxury Redefined
							</h2>
							<p className="text-lg text-gray-700 mb-8 leading-relaxed">
								{apartment.description}
							</p>
							<div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600 mb-1">
											Starting from
										</p>
										<p className="text-3xl font-bold text-amber-700">
											₦{apartment.price_per_night}
											<span className="text-lg font-normal text-gray-600">
												/night
											</span>
										</p>
									</div>
									<Link
										to="/booking"
										className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
									>
										Check Availability
									</Link>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							{apartment.photos
								.slice(1, 5)
								.map((photo, index) => (
									<div
										key={index}
										className="aspect-square overflow-hidden rounded-xl"
									>
										<img
											src={photo}
											alt={`${apartment.name} ${
												index + 1
											}`}
											className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
										/>
									</div>
								))}
						</div>
					</div>
				</div>
			</section>

			{/* Amenities Section */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Premium Amenities
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Every detail carefully curated for your comfort and
							convenience
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{apartment.amenities.map((amenity, index) => (
							<div
								key={index}
								className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
										{amenity.includes("WiFi") && (
											<Wifi className="w-6 h-6 text-amber-600" />
										)}
										{amenity.includes("parking") && (
											<Car className="w-6 h-6 text-amber-600" />
										)}
										{amenity.includes("kitchen") && (
											<Utensils className="w-6 h-6 text-amber-600" />
										)}
										{amenity.includes("bathroom") && (
											<Bath className="w-6 h-6 text-amber-600" />
										)}
										{amenity.includes("bed") && (
											<Bed className="w-6 h-6 text-amber-600" />
										)}
										{!amenity.includes("WiFi") &&
											!amenity.includes("parking") &&
											!amenity.includes("kitchen") &&
											!amenity.includes("bathroom") &&
											!amenity.includes("bed") && (
												<Star className="w-6 h-6 text-amber-600" />
											)}
									</div>
									<p className="text-gray-800 font-medium">
										{amenity}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-bold text-white mb-6">
						Ready for Your Luxury Getaway?
					</h2>
					<p className="text-xl text-amber-100 mb-8">
						Book now and experience the pinnacle of comfort and
						elegance
					</p>
					<Link
						to="/booking"
						className="inline-flex items-center space-x-2 bg-white text-amber-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
					>
						<Calendar className="w-5 h-5" />
						<span>Reserve Your Stay</span>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
									<img src={logo} alt="Brinkett Logo" />
								</div>
								<h3 className="text-xl font-bold">Brinkett</h3>
							</div>
							<p className="text-gray-400">
								Premium luxury accommodations for discerning
								travelers seeking the finest experiences.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Contact</h4>
							<div className="space-y-2 text-gray-400">
								<p>Email: info@brinkett.com.ng</p>
								<p>Phone: +234 806 688 6431</p>
								<p>Available 24/7</p>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Policies</h4>
							<div className="space-y-2 text-gray-400">
								<p>Check-in: 2:00 PM</p>
								<p>Check-out: 12:00 PM</p>
								<p>Free cancellation up to 48 hours</p>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
						<p>
							&copy; {new Date().getFullYear()} Brinkett. All
							rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Home;
