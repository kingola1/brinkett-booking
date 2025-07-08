import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building, Star, Shield, Phone } from "lucide-react";
import logo from "../assets/brinkett-logo.png";

const Landing: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-r from-amber-600 to-amber-700">
				<div className="absolute inset-0 bg-black opacity-50"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
					<div className="flex justify-center mb-8">
						<div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
							<img
								src={logo}
								alt="Brinkett Logo"
								className="w-12 h-12"
							/>
						</div>
					</div>
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						Welcome to Brinkett Properties
					</h1>
					<p className="text-xl md:text-2xl text-amber-100 mb-12 max-w-3xl mx-auto">
						Discover luxury living in the heart of Abuja. Premium
						apartments curated for your comfort and style.
					</p>
					<Link
						to="/apartments"
						className="inline-flex items-center space-x-2 bg-white text-amber-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
					>
						<span>View Our Apartments</span>
						<ArrowRight className="w-5 h-5" />
					</Link>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-24 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Why Choose Brinkett?
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Experience unparalleled luxury and service in every
							property we manage
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
						<div className="text-center">
							<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<Building className="w-8 h-8 text-amber-600" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">
								Premium Locations
							</h3>
							<p className="text-gray-600">
								Strategically located properties in Abuja's most
								sought-after neighborhoods
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<Star className="w-8 h-8 text-amber-600" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">
								Luxury Amenities
							</h3>
							<p className="text-gray-600">
								State-of-the-art facilities and premium
								furnishings in every apartment
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
								<Shield className="w-8 h-8 text-amber-600" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-4">
								Secure & Private
							</h3>
							<p className="text-gray-600">
								24/7 security and privacy measures for your
								peace of mind
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Contact Section */}
			<div className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="bg-amber-50 rounded-2xl p-12">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								Get in Touch
							</h2>
							<p className="text-lg text-gray-600">
								Have questions about our properties? We're here
								to help.
							</p>
						</div>

						<div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
							<div className="flex items-center space-x-4">
								<Phone className="w-6 h-6 text-amber-600" />
								<div>
									<p className="text-sm text-gray-600">
										Call us at
									</p>
									<p className="font-semibold text-gray-900">
										+234 806 688 6431
									</p>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-600">
									Email us at
								</p>
								<p className="font-semibold text-gray-900">
									info@brinkett.com.ng
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="flex items-center space-x-3 mb-6 md:mb-0">
							<div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
								<img
									src={logo}
									alt="Brinkett Logo"
									className="w-6 h-6"
								/>
							</div>
							<span className="text-xl font-bold">Brinkett</span>
						</div>
						<div className="text-center md:text-left text-gray-400">
							<p>
								&copy; {new Date().getFullYear()} Brinkett. All
								rights reserved.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Landing;
