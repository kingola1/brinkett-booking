import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	Calendar,
	Settings,
	LogOut,
	BookOpen,
	Home,
	Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/brinkett-logo.png";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout, username } = useAuth();
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

	const handleLogout = async () => {
		await logout();
		navigate("/admin");
	};

	const navigation = [
		{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
		{ name: "Bookings", href: "/admin/bookings", icon: BookOpen },
		{ name: "Calendar", href: "/admin/calendar", icon: Calendar },
		{ name: "Apartments", href: "/admin/apartments", icon: Home },
		{ name: "Add Apartment", href: "/admin/add-apartment", icon: Plus },
		{ name: "Settings", href: "/admin/settings", icon: Settings },
	];

	const isActive = (path: string) => location.pathname === path;

	return (
		<div className="min-h-screen bg-gray-50 flex relative">
			{/* Mobile Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-20"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Mobile Toggle Button */}
			<button
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md"
			>
				<svg
					className="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d={
							isSidebarOpen
								? "M6 18L18 6M6 6l12 12"
								: "M4 6h16M4 12h16M4 18h16"
						}
					/>
				</svg>
			</button>

			{/* Sidebar */}
			<div
				className={`fixed lg:static inset-y-0 left-0 transform ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0 transition duration-200 ease-in-out w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col z-30`}
			>
				{/* Logo */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
							<img
								src={logo}
								alt="Brinkett Logo"
								className="w-8 h-8"
							/>
						</div>
						<div>
							<h1 className="text-xl font-bold text-gray-900">
								Brinkett
							</h1>
							<p className="text-sm text-gray-600">Admin Panel</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4">
					<ul className="space-y-2">
						{navigation.map((item) => (
							<li key={item.name}>
								<Link
									to={item.href}
									className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
										isActive(item.href)
											? "bg-amber-50 text-amber-700 border-r-2 border-amber-700"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<item.icon className="w-5 h-5" />
									<span className="font-medium">
										{item.name}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</nav>

				{/* User Info & Logout */}
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
							<span className="text-sm font-medium text-gray-700">
								{username?.charAt(0).toUpperCase()}
							</span>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-900">
								{username}
							</p>
							<p className="text-xs text-gray-500">
								Administrator
							</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
					>
						<LogOut className="w-4 h-4" />
						<span>Sign Out</span>
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<div className="p-8">{children}</div>
			</div>
		</div>
	);
};

export default AdminLayout;
