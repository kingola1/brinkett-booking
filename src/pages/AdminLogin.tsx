import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLogin: React.FC = () => {
	const navigate = useNavigate();
	const { login, isAuthenticated } = useAuth();
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/admin/dashboard");
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const success = await login(credentials.username, credentials.password);

		if (success) {
			navigate("/admin/dashboard");
		} else {
			setError("Invalid username or password");
		}

		setLoading(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCredentials((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
			<div className="absolute top-6 left-6">
				<Link
					to="/"
					className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
					<span>Back to Home</span>
				</Link>
			</div>

			<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<Lock className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Admin Login
					</h1>
					<p className="text-gray-600">Access the admin dashboard</p>
				</div>

				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Username
						</label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								name="username"
								value={credentials.username}
								onChange={handleInputChange}
								required
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								placeholder="Enter username"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="password"
								name="password"
								value={credentials.password}
								onChange={handleInputChange}
								required
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
								placeholder="Enter password"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
					>
						{loading ? (
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
						) : (
							"Sign In"
						)}
					</button>
				</form>

				<div className="mt-6 text-center"></div>
			</div>
		</div>
	);
};

export default AdminLogin;
