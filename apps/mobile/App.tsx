import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const App = () => {
	const [messages, setMessages] = useState<string[]>([]);
	const ws = new WebSocket("ws://192.168.0.175:8080");

	useEffect(() => {
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
		<SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
			<Text>Messages:</Text>
			{messages.map((message, index) => (
				<Text key={index}>{message}</Text>
			))}
			<View
				style={{
					flexDirection: "row",
					width: "100%",
					justifyContent: "space-around"
				}}
			>
				<Pressable
					onPress={() => {
						ws.send("play");
					}}
					style={{
						width: 72,
						height: 48,
						backgroundColor: "green",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<Text style={{ color: "white", fontWeight: "bold" }}>
						Play
					</Text>
				</Pressable>
				<Pressable
					onPress={() => {
						ws.send("pause");
					}}
					style={{
						width: 72,
						height: 48,
						backgroundColor: "green",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<Text style={{ color: "white", fontWeight: "bold" }}>
						Pause
					</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
};

export default App;
