"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_native_1 = require("react-native");
const App = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const ws = new WebSocket("ws://192.168.0.175:8080");
    (0, react_1.useEffect)(() => {
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
    return (<react_native_1.SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
			<react_native_1.Text>Messages:</react_native_1.Text>
			{messages.map((message, index) => (<react_native_1.Text key={index}>{message}</react_native_1.Text>))}
			<react_native_1.View style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around"
        }}>
				<react_native_1.Pressable onPress={() => {
            ws.send("play");
        }} style={{
            width: 72,
            height: 48,
            backgroundColor: "green",
            justifyContent: "center",
            alignItems: "center"
        }}>
					<react_native_1.Text style={{ color: "white", fontWeight: "bold" }}>
						Play
					</react_native_1.Text>
				</react_native_1.Pressable>
				<react_native_1.Pressable onPress={() => {
            ws.send("pause");
        }} style={{
            width: 72,
            height: 48,
            backgroundColor: "green",
            justifyContent: "center",
            alignItems: "center"
        }}>
					<react_native_1.Text style={{ color: "white", fontWeight: "bold" }}>
						Pause
					</react_native_1.Text>
				</react_native_1.Pressable>
			</react_native_1.View>
		</react_native_1.SafeAreaView>);
};
exports.default = App;
