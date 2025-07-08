import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../utils/api";
import { API_BASE_URL } from "../config/api";

interface ApartmentForm {
	name: string;
	description: string;
	location: string;
	price_per_night: number;
	max_guests: number;
	amenities: string[];
	photos: { url: string }[];
	primaryPhotoIndex: number;
}

const defaultForm: ApartmentForm = {
	name: "",
	description: "",
	location: "",
	price_per_night: 0,
	max_guests: 1,
	amenities: [""],
	photos: [],
	primaryPhotoIndex: 0,
};

export function AdminAddApartment() {
	const [form, setForm] = useState<ApartmentForm>(defaultForm);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleChange(field: keyof ApartmentForm, value: unknown) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	function handleAmenityChange(index: number, value: string) {
		setForm((prev) => {
			const amenities = [...prev.amenities];
			amenities[index] = value;
			return { ...prev, amenities };
		});
	}

	function addAmenity() {
		setForm((prev) => ({ ...prev, amenities: [...prev.amenities, ""] }));
	}

	function removeAmenity(index: number) {
		setForm((prev) => ({
			...prev,
			amenities: prev.amenities.filter((_, i) => i !== index),
		}));
	}

	function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;
		setUploading(true);
		setError(null);
		Promise.all(
			files.map(async (file) => {
				const formData = new FormData();
				formData.append("image", file);
				const res = await fetch("/api/apartment/upload", {
					method: "POST",
					body: formData,
				});
				const data = await res.json();
				if (!data.url) throw new Error("Image upload failed");
				return { url: data.url };
			})
		)
			.then((uploaded) => {
				setForm((prev) => ({
					...prev,
					photos: [...(prev.photos || []), ...uploaded],
				}));
			})
			.catch(() => setError("Image upload failed"))
			.finally(() => setUploading(false));
	}

	function removePhoto(idx: number) {
		setForm((prev) => ({
			...prev,
			photos: prev.photos.filter((_, i) => i !== idx),
			primaryPhotoIndex:
				prev.primaryPhotoIndex === idx
					? 0
					: prev.primaryPhotoIndex > idx
					? prev.primaryPhotoIndex - 1
					: prev.primaryPhotoIndex,
		}));
	}

	function setPrimary(idx: number) {
		setForm((prev) => ({ ...prev, primaryPhotoIndex: idx }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await api.post(
				"/apartment",
				{
					...form,
					photos: undefined,
					primaryPhotoIndex: undefined,
				},
				{ credentials: "include" }
			);
			const apartmentId = res.apartmentId;
			await Promise.all(
				(form.photos || []).map((photo, idx) =>
					api.post(
						`/apartment/${apartmentId}/photos`,
						{
							photo_url: photo.url,
							is_primary: idx === form.primaryPhotoIndex,
						},
						{ credentials: "include" }
					)
				)
			);
			navigate("/admin/apartments");
		} catch (err) {
			if (err instanceof Error) setError(err.message);
			else setError("Failed to add apartment");
		} finally {
			setLoading(false);
		}
	}

	return (
		<AdminLayout>
			<div className="max-w-2xl mx-auto py-8">
				<h1 className="text-2xl font-bold mb-6">Add New Apartment</h1>
				{error && <div className="mb-4 text-red-600">{error}</div>}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block mb-1 font-medium">Name</label>
						<input
							type="text"
							value={form.name}
							onChange={(e) =>
								handleChange("name", e.target.value)
							}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">
							Description
						</label>
						<textarea
							value={form.description}
							onChange={(e) =>
								handleChange("description", e.target.value)
							}
							className="w-full border px-3 py-2 rounded"
							rows={3}
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">
							Location
						</label>
						<input
							type="text"
							value={form.location}
							onChange={(e) =>
								handleChange("location", e.target.value)
							}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">
							Price per Night (₦)
						</label>
						<input
							type="number"
							min={0}
							value={form.price_per_night}
							onChange={(e) =>
								handleChange(
									"price_per_night",
									parseFloat(e.target.value)
								)
							}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">
							Max Guests
						</label>
						<input
							type="number"
							min={1}
							value={form.max_guests}
							onChange={(e) =>
								handleChange(
									"max_guests",
									parseInt(e.target.value)
								)
							}
							className="w-full border px-3 py-2 rounded"
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">
							Amenities
						</label>
						{form.amenities.map((amenity, idx) => (
							<div key={idx} className="flex items-center mb-2">
								<input
									type="text"
									value={amenity}
									onChange={(e) =>
										handleAmenityChange(idx, e.target.value)
									}
									className="flex-1 border px-3 py-2 rounded"
									required
								/>
								<button
									type="button"
									onClick={() => removeAmenity(idx)}
									className="ml-2 text-red-600"
									disabled={form.amenities.length === 1}
								>
									Remove
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={addAmenity}
							className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
						>
							Add Amenity
						</button>
					</div>
					<div>
						<label className="block mb-1 font-medium">Photos</label>
						<input
							type="file"
							accept="image/*"
							multiple
							onChange={handleImageUpload}
							disabled={uploading}
							ref={fileInputRef}
							aria-label="Upload apartment photos"
						/>
						<div className="flex flex-wrap gap-4 mt-2">
							{(form.photos || []).map((photo, idx) => (
								<div key={idx} className="relative group">
									<img
										src={
											photo.url.startsWith("/uploads/")
												? `${API_BASE_URL.replace(
														/\/api$/,
														""
												  )}${photo.url}`
												: photo.url
										}
										alt={`Apartment photo ${idx + 1}`}
										className={`w-24 h-24 object-cover rounded border-2 ${
											idx === form.primaryPhotoIndex
												? "border-amber-600"
												: "border-gray-300"
										}`}
									/>
									<button
										type="button"
										onClick={() => setPrimary(idx)}
										className={`absolute top-1 left-1 bg-white rounded-full p-1 ${
											idx === form.primaryPhotoIndex
												? "text-amber-600"
												: "text-gray-400"
										}`}
										aria-label={
											idx === form.primaryPhotoIndex
												? "Primary photo"
												: "Set as primary"
										}
									>
										★
									</button>
									<button
										type="button"
										onClick={() => removePhoto(idx)}
										className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600"
										aria-label="Remove photo"
									>
										×
									</button>
								</div>
							))}
						</div>
						{uploading && (
							<div className="text-sm text-gray-500 mt-2">
								Uploading...
							</div>
						)}
					</div>
					<button
						type="submit"
						className="w-full bg-amber-600 text-white py-3 rounded font-semibold mt-4"
						disabled={loading}
					>
						{loading ? "Adding..." : "Add Apartment"}
					</button>
				</form>
			</div>
		</AdminLayout>
	);
}

export default AdminAddApartment;
