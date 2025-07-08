import React, { useState } from "react";
import { Trash2, Upload, Check, X, Loader2 } from "lucide-react";

interface Photo {
	id: number;
	url: string;
	is_primary: boolean;
}

interface PhotoManagerProps {
	apartmentId: number;
	photos: Photo[];
	onPhotosChange: (newPhotos: Photo[]) => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({
	apartmentId,
	photos,
	onPhotosChange,
}) => {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);
		setError(null);

		for (const file of files) {
			try {
				// First upload to Cloudinary
				const formData = new FormData();
				formData.append("file", file);
				formData.append("upload_preset", "brinkett_apartments"); // Set up in Cloudinary

				const cloudinaryResponse = await fetch(
					"https://api.cloudinary.com/v1_1/dcyxl8lta/image/upload",
					{
						method: "POST",
						body: formData,
					}
				);

				const cloudinaryData = await cloudinaryResponse.json();

				if (!cloudinaryData.secure_url) {
					throw new Error("Failed to upload image to Cloudinary");
				}

				// Then save to our backend
				const response = await fetch(
					`https://apartment.brinkett.com.ng/api/apartment/${apartmentId}/photos`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							photo_url: cloudinaryData.secure_url,
							is_primary: photos.length === 0, // Make primary if it's the first photo
						}),
					}
				);

				const data = await response.json();
				if (!data.success) {
					throw new Error(data.error || "Failed to save photo");
				}

				// Update the photos list
				const newPhoto: Photo = {
					id: data.photoId,
					url: cloudinaryData.secure_url,
					is_primary: photos.length === 0,
				};

				onPhotosChange([...photos, newPhoto]);
			} catch (error) {
				console.error("Upload error:", error);
				setError("Failed to upload image. Please try again.");
			}
		}

		setUploading(false);
	};

	const deletePhoto = async (photoId: number) => {
		try {
			const response = await fetch(
				`https://apartment.brinkett.com.ng/api/apartment/${apartmentId}/photos/${photoId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to delete photo");
			}

			onPhotosChange(photos.filter((photo) => photo.id !== photoId));
		} catch (error) {
			console.error("Delete error:", error);
			setError("Failed to delete photo. Please try again.");
		}
	};

	const setPrimaryPhoto = async (photoId: number) => {
		try {
			const response = await fetch(
				`https://apartment.brinkett.com.ng/api/apartment/${apartmentId}/photos/${photoId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ is_primary: true }),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to set primary photo");
			}

			onPhotosChange(
				photos.map((photo) => ({
					...photo,
					is_primary: photo.id === photoId,
				}))
			);
		} catch (error) {
			console.error("Set primary error:", error);
			setError("Failed to set primary photo. Please try again.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">
					Apartment Photos
				</h3>
				<label className="cursor-pointer">
					<input
						type="file"
						accept="image/*"
						multiple
						onChange={handleFileUpload}
						className="hidden"
						disabled={uploading}
					/>
					<span className="inline-flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
						{uploading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>Uploading...</span>
							</>
						) : (
							<>
								<Upload className="w-5 h-5" />
								<span>Upload Photos</span>
							</>
						)}
					</span>
				</label>
			</div>

			{error && (
				<div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
					<X className="w-5 h-5" />
					<p>{error}</p>
				</div>
			)}

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{photos.map((photo) => (
					<div
						key={photo.id}
						className="relative group aspect-square overflow-hidden rounded-lg border border-gray-200"
					>
						<img
							src={photo.url}
							alt="Apartment"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
							{!photo.is_primary && (
								<button
									onClick={() => setPrimaryPhoto(photo.id)}
									className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
									title="Set as primary photo"
								>
									<Check className="w-5 h-5" />
								</button>
							)}
							<button
								onClick={() => deletePhoto(photo.id)}
								className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								title="Delete photo"
							>
								<Trash2 className="w-5 h-5" />
							</button>
						</div>
						{photo.is_primary && (
							<div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 text-xs rounded">
								Primary
							</div>
						)}
					</div>
				))}
			</div>

			<p className="text-sm text-gray-600">
				* The first uploaded photo will automatically become the primary
				photo. Hover over photos to manage them.
			</p>
		</div>
	);
};

export default PhotoManager;
