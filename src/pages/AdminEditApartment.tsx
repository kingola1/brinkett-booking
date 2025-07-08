import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { api } from "../utils/api";
import { API_BASE_URL } from "../config/api";

interface ApartmentPhoto {
	id?: number;
	url: string;
	is_primary?: boolean;
}

interface ApartmentForm {
	name: string;
	description: string;
	location: string;
	price_per_night: number;
	max_guests: number;
	amenities: string[];
	photos: ApartmentPhoto[];
	primaryPhotoIndex: number;
}

export default function AdminEditApartment() {
	const { id } = useParams<{ id: string }>();
	const [form, setForm] = useState<ApartmentForm | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchApartment();
		// eslint-disable-next-line
	}, [id]);

	async function fetchApartment() {
		setLoading(true);
		setError(null);
		try {
			const data = await api.get(`/apartment/${id}`, {
				credentials: "include",
			});
			setForm({
				name: data.name,
				description: data.description,
				location: data.location,
				price_per_night: data.price_per_night,
				max_guests: data.max_guests,
				amenities: data.amenities || [],
				photos: Array.isArray(data.photos)
					? data.photos.map(
							(p: {
								id: number;
								url: string;
								is_primary: boolean;
							}) => ({
								id: p.id,
								url: p.url,
								is_primary: p.is_primary,
							})
					  )
					: [],
				primaryPhotoIndex: Array.isArray(data.photos)
					? Math.max(
							0,
							data.photos.findIndex(
								(p: { is_primary?: boolean }) =>
									p && p.is_primary
							)
					  )
					: 0,
			});
		} catch {
			setError("Failed to load apartment");
		} finally {
			setLoading(false);
		}
	}

	function handleChange(field: keyof ApartmentForm, value: unknown) {
		setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
	}

	function handleAmenityChange(index: number, value: string) {
		setForm((prev) => {
			if (!prev) return prev;
			const amenities = [...prev.amenities];
			amenities[index] = value;
			return { ...prev, amenities };
		});
	}

	function addAmenity() {
		setForm((prev) =>
			prev ? { ...prev, amenities: [...prev.amenities, ""] } : prev
		);
	}

	function removeAmenity(index: number) {
		setForm((prev) =>
			prev
				? {
						...prev,
						amenities: prev.amenities.filter((_, i) => i !== index),
				  }
				: prev
		);
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
					...prev!,
					photos: [...(prev?.photos || []), ...uploaded],
				}));
			})
			.catch(() => setError("Image upload failed"))
			.finally(() => setUploading(false));
	}

	async function removePhoto(idx: number) {
		if (!form) return;
		const photo = form.photos[idx];
		if (photo.id) {
			try {
				await api.delete(`/apartment/${id}/photos/${photo.id}`, {
					credentials: "include",
				});
			} catch {
				setError("Failed to delete photo");
				return;
			}
		}
		setForm((prev) => ({
			...prev!,
			photos: prev!.photos.filter((_, i) => i !== idx),
			primaryPhotoIndex:
				prev!.primaryPhotoIndex === idx
					? 0
					: prev!.primaryPhotoIndex > idx
					? prev!.primaryPhotoIndex - 1
					: prev!.primaryPhotoIndex,
		}));
	}

	function setPrimary(idx: number) {
		setForm((prev) => ({ ...prev!, primaryPhotoIndex: idx }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!form) return;
		setSaving(true);
		setError(null);
		try {
			await api.put(
				`/apartment/${id}`,
				{
					...form,
					photos: undefined,
					primaryPhotoIndex: undefined,
				},
				{ credentials: "include" }
			);
			// Upload all photos
			await Promise.all(
				(form.photos || [])
					.filter((photo) => !photo.id)
					.map((photo, idx) =>
						api.post(
							`/apartment/${id}/photos`,
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
			else setError("Failed to update apartment");
		} finally {
			setSaving(false);
		}
	}

	if (loading || !form) {
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
			<div className="max-w-2xl mx-auto py-8">
				<h1 className="text-2xl font-bold mb-6">Edit Apartment</h1>
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
						disabled={saving}
					>
						{saving ? "Saving..." : "Save Changes"}
					</button>
				</form>
			</div>
		</AdminLayout>
	);
}
