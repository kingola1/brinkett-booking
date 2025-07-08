import { API_BASE_URL } from "../config/api";

interface ApiOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
}

function buildUrl(
	endpoint: string,
	params?: Record<string, string | number | boolean>
) {
	let url = `${API_BASE_URL}${endpoint}`;
	if (params) {
		const query = Object.entries(params)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(
						String(value)
					)}`
			)
			.join("&");
		url += url.includes("?") ? `&${query}` : `?${query}`;
	}
	return url;
}

async function request<T = any>(
	method: string,
	endpoint: string,
	data?: any,
	options: ApiOptions = {}
): Promise<T> {
	const { params, headers, ...rest } = options;
	const url = buildUrl(endpoint, params);
	const fetchOptions: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		...rest,
	};
	if (data) fetchOptions.body = JSON.stringify(data);
	const response = await fetch(url, fetchOptions);
	if (!response.ok) {
		let errorMsg = `API error: ${response.status}`;
		try {
			const errorData = await response.json();
			errorMsg = errorData.error || errorMsg;
		} catch {}
		throw new Error(errorMsg);
	}
	if (response.status === 204) return undefined as T;
	return response.json();
}

export const api = {
	get: <T = any>(endpoint: string, options?: ApiOptions) =>
		request<T>("GET", endpoint, undefined, options),
	post: <T = any, D = any>(endpoint: string, data: D, options?: ApiOptions) =>
		request<T>("POST", endpoint, data, options),
	put: <T = any, D = any>(endpoint: string, data: D, options?: ApiOptions) =>
		request<T>("PUT", endpoint, data, options),
	patch: <T = any, D = any>(
		endpoint: string,
		data: D,
		options?: ApiOptions
	) => request<T>("PATCH", endpoint, data, options),
	delete: <T = any>(endpoint: string, options?: ApiOptions) =>
		request<T>("DELETE", endpoint, undefined, options),
};
