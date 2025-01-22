import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
	sayHello: () => "Hello from NeoCable!"
});
