import { setAuthToken } from "@/SERVICE/api";
import { useAuthStore } from "@/stores/authStore";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
	const { token } = useAuthStore();

	// ✅ Set auth token when app loads
	useEffect(() => {
		if (token) {
			setAuthToken(token);
			console.log("✅ Auth token set on app load");
		} else {
			console.log("⚠️ No auth token found");
		}
	}, [token]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
