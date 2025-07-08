/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

interface AuthContextType {
	isAuthenticated: boolean;
	username: string | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [username, setUsername] = useState<string | null>(null);

	const checkAuth = async () => {
		try {
			const data = await api.get("/auth/check", {
				credentials: "include",
			});
			setIsAuthenticated(data.authenticated);
			setUsername(data.username || null);
		} catch (error) {
			console.error("Auth check failed:", error);
			setIsAuthenticated(false);
			setUsername(null);
		}
	};

	const login = async (
		username: string,
		password: string
	): Promise<boolean> => {
		try {
			const data = await api.post(
				"/auth/login",
				{ username, password },
				{ credentials: "include" }
			);
			if (data.success) {
				setIsAuthenticated(true);
				setUsername(data.username);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Login failed:", error);
			return false;
		}
	};

	const logout = async () => {
		try {
			await api.post("/auth/logout", {}, { credentials: "include" });
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsAuthenticated(false);
			setUsername(null);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	const value = {
		isAuthenticated,
		username,
		login,
		logout,
		checkAuth,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
