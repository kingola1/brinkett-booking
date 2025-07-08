import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../utils/api";

const settingKeys = [
	{ key: "terms_and_conditions", label: "Terms and Conditions" },
	{ key: "cancellation_policy", label: "Cancellation Policy" },
	{ key: "check_in_time", label: "Check-in Time" },
	{ key: "check_out_time", label: "Check-out Time" },
];

export default function AdminSettings() {
	const [settings, setSettings] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState("");

	useEffect(() => {
		fetchSettings();
	}, []);

	async function fetchSettings() {
		setLoading(true);
		setError(null);
		try {
			const data = await api.get("/admin/global-settings", {
				credentials: "include",
			});
			setSettings(data);
		} catch {
			setError("Failed to load settings");
		} finally {
			setLoading(false);
		}
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			await api.put("/admin/global-settings", settings, {
				credentials: "include",
			});
			setMessage("Settings saved successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch {
			setError("Failed to save settings");
		} finally {
			setSaving(false);
		}
	}

	function handleChange(key: string, value: string) {
		setSettings((prev) => ({ ...prev, [key]: value }));
	}

	return (
		<AdminLayout>
			<div className="max-w-2xl mx-auto py-8">
				<h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
				{error && <div className="mb-4 text-red-600">{error}</div>}
				{message && (
					<div className="mb-4 text-green-600">{message}</div>
				)}
				{loading ? (
					<div className="flex items-center justify-center h-32">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
					</div>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSave();
						}}
						className="space-y-6"
					>
						{settingKeys.map(({ key, label }) => (
							<div key={key}>
								<label className="block mb-1 font-medium">
									{label}
								</label>
								<textarea
									value={settings[key] || ""}
									onChange={(e) =>
										handleChange(key, e.target.value)
									}
									className="w-full border px-3 py-2 rounded"
									rows={
										key.includes("policy") ||
										key.includes("terms")
											? 4
											: 1
									}
									required
								/>
							</div>
						))}
						<button
							type="submit"
							className="w-full bg-amber-600 text-white py-3 rounded font-semibold mt-4"
							disabled={saving}
						>
							{saving ? "Saving..." : "Save Settings"}
						</button>
					</form>
				)}
			</div>
		</AdminLayout>
	);
}
