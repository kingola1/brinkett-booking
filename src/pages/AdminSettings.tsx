import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Image, DollarSign, Users, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

interface Apartment {
	id: number;
	name: string;
	description: string;
	price_per_night: number;
	max_guests: number;
	amenities: string[];
	photos: string[];
}

const AdminSettings: React.FC = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [apartment, setApartment] = useState<Apartment | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/admin");
			return;
		}
		fetchApartmentData();
	}, [isAuthenticated, navigate]);

	const fetchApartmentData = async () => {
		try {
			const response = await fetch(
				"https://apartment.brinkett.com.ng/api/apartment",
				{
					credentials: "include",
				}
			);
			const data = await response.json();
			setApartment(data);
		} catch (error) {
			console.error("Failed to fetch apartment data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!apartment) return;

		setSaving(true);
		setMessage("");

		try {
			const response = await fetch(
				"https://apartment.brinkett.com.ng/api/apartment",
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(apartment),
				}
			);

			if (response.ok) {
				setMessage("Settings saved successfully!");
				setTimeout(() => setMessage(""), 3000);
			} else {
				setMessage("Failed to save settings");
			}
		} catch (error) {
			console.error("Failed to save settings:", error);
			setMessage("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (field: keyof Apartment, value: any) => {
		if (!apartment) return;

		setApartment((prev) => (prev ? { ...prev, [field]: value } : null));
	};

	const handleAmenityChange = (index: number, value: string) => {
		if (!apartment) return;

		const newAmenities = [...apartment.amenities];
		newAmenities[index] = value;
		handleInputChange("amenities", newAmenities);
	};

	const addAmenity = () => {
		if (!apartment) return;

		handleInputChange("amenities", [...apartment.amenities, ""]);
	};

	const removeAmenity = (index: number) => {
		if (!apartment) return;

		const newAmenities = apartment.amenities.filter((_, i) => i !== index);
		handleInputChange("amenities", newAmenities);
	};

	const handlePhotoChange = (index: number, value: string) => {
		if (!apartment) return;

		const newPhotos = [...apartment.photos];
		newPhotos[index] = value;
		handleInputChange("photos", newPhotos);
	};

	const addPhoto = () => {
		if (!apartment) return;

		handleInputChange("photos", [...apartment.photos, ""]);
	};

	const removePhoto = (index: number) => {
		if (!apartment) return;

		const newPhotos = apartment.photos.filter((_, i) => i !== index);
		handleInputChange("photos", newPhotos);
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

	if (!apartment) {
		return (
			<AdminLayout>
				<div className="text-center py-12">
					<p className="text-gray-500">
						Failed to load apartment data
					</p>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Settings
						</h1>
						<p className="text-gray-600 mt-2">
							Manage apartment details and configuration
						</p>
					</div>
					<button
						onClick={handleSave}
						disabled={saving}
						className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
					>
						<Save className="w-4 h-4" />
						<span>{saving ? "Saving..." : "Save Changes"}</span>
					</button>
				</div>

				{message && (
					<div
						className={`p-4 rounded-lg ${
							message.includes("successfully")
								? "bg-green-50 text-green-700 border border-green-200"
								: "bg-red-50 text-red-700 border border-red-200"
						}`}
					>
						{message}
					</div>
				)}

				{/* Basic Information */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
							<FileText className="w-4 h-4 text-blue-600" />
						</div>
						<h2 className="text-xl font-bold text-gray-900">
							Basic Information
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Apartment Name
							</label>
							<input
								type="text"
								value={apartment.name}
								onChange={(e) =>
									handleInputChange("name", e.target.value)
								}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Maximum Guests
							</label>
							<div className="relative">
								<Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="number"
									min="1"
									max="20"
									value={apartment.max_guests}
									onChange={(e) =>
										handleInputChange(
											"max_guests",
											parseInt(e.target.value)
										)
									}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Price per Night (₦)
							</label>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="number"
									min="0"
									step="0.01"
									value={apartment.price_per_night}
									onChange={(e) =>
										handleInputChange(
											"price_per_night",
											parseFloat(e.target.value)
										)
									}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								/>
							</div>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Description
							</label>
							<textarea
								rows={4}
								value={apartment.description}
								onChange={(e) =>
									handleInputChange(
										"description",
										e.target.value
									)
								}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								placeholder="Describe your luxury apartment..."
							/>
						</div>
					</div>
				</div>

				{/* Amenities */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
								<Users className="w-4 h-4 text-green-600" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">
								Amenities
							</h2>
						</div>
						<button
							onClick={addAmenity}
							className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
						>
							Add Amenity
						</button>
					</div>

					<div className="space-y-3">
						{apartment.amenities.map((amenity, index) => (
							<div
								key={index}
								className="flex items-center space-x-3"
							>
								<input
									type="text"
									value={amenity}
									onChange={(e) =>
										handleAmenityChange(
											index,
											e.target.value
										)
									}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
									placeholder="Enter amenity..."
								/>
								<button
									onClick={() => removeAmenity(index)}
									className="text-red-600 hover:text-red-700 px-3 py-2"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Photos */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
								<Image className="w-4 h-4 text-purple-600" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">
								Photos
							</h2>
						</div>
						<button
							onClick={addPhoto}
							className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
						>
							Add Photo
						</button>
					</div>

					<div className="space-y-4">
						{apartment.photos.map((photo, index) => (
							<div
								key={index}
								className="flex items-center space-x-3"
							>
								<div className="flex-1 flex items-center space-x-3">
									<img
										src={photo}
										alt={`Photo ${index + 1}`}
										className="w-16 h-16 object-cover rounded-lg"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"https://via.placeholder.com/64x64?text=Error";
										}}
									/>
									<input
										type="url"
										value={photo}
										onChange={(e) =>
											handlePhotoChange(
												index,
												e.target.value
											)
										}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
										placeholder="Enter photo URL..."
									/>
								</div>
								<button
									onClick={() => removePhoto(index)}
									className="text-red-600 hover:text-red-700 px-3 py-2"
								>
									Remove
								</button>
							</div>
						))}
					</div>

					<div className="mt-4 p-4 bg-gray-50 rounded-lg">
						<p className="text-sm text-gray-600">
							<strong>Tip:</strong> Use high-quality images from
							Pexels or other stock photo services. Make sure URLs
							are direct links to the image files (ending in .jpg,
							.png, etc.).
						</p>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminSettings;
