import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Apartments from "./pages/Apartments";
import ApartmentDetails from "./pages/ApartmentDetails";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminCalendar from "./pages/AdminCalendar";
import AdminSettings from "./pages/AdminSettings";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./components/AdminLayout";
import { AdminApartments } from "./pages/AdminApartment";
import AdminAddApartment from "./pages/AdminAddApartment";
import AdminEditApartment from "./pages/AdminEditApartment";
import AdminViewBooking from "./pages/AdminViewBooking";

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="min-h-screen bg-gray-50">
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Landing />} />
						<Route path="/apartments" element={<Apartments />} />
						<Route
							path="/apartments/:id"
							element={<ApartmentDetails />}
						/>
						<Route
							path="/booking/:apartmentId"
							element={<Booking />}
						/>
						<Route
							path="/confirmation/:bookingId"
							element={<Confirmation />}
						/>

						{/* Admin Routes */}
						<Route path="/admin" element={<AdminLogin />} />
						<Route
							path="/admin/dashboard"
							element={<AdminDashboard />}
						/>
						<Route
							path="/admin/bookings"
							element={<AdminBookings />}
						/>
						<Route
							path="/admin/calendar"
							element={<AdminCalendar />}
						/>
						<Route
							path="/admin/settings"
							element={<AdminSettings />}
						/>
						<Route
							path="/admin/apartments"
							element={
								<AdminLayout>
									<AdminApartments />
								</AdminLayout>
							}
						/>
						<Route
							path="/admin/add-apartment"
							element={<AdminAddApartment />}
						/>
						<Route
							path="/admin/edit-apartment/:id"
							element={<AdminEditApartment />}
						/>
						<Route
							path="/admin/bookings/:id"
							element={<AdminViewBooking />}
						/>
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
