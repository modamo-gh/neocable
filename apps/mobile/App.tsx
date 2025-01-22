import { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";

const App = () => {
	const [messages, setMessages] = useState<string[]>([]);

	useEffect(() => {
		const ws = new WebSocket("ws://192.168.0.158:8080");

		ws.onopen = () => {
			console.log("Connected to WebSocket server");
			ws.send("Hello from mobile app!");
		};

		ws.onmessage = (event) => {
			console.log("Message from server:", event.data);
			setMessages((prev) => [...prev, event.data]);
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		ws.onclose = () => {
			console.log("WebSocket connection closed");
		};

		return () => {
			ws.close();
		};
	}, []);

	return (
		<SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
			<Text>Messages:</Text>
			{messages.map((message, index) => (
				<Text key={index}>{message}</Text>
			))}
		</SafeAreaView>
	);
};

export default App;
