import { API, APIKey } from "./api";

declare global {
	// interface Window {
	//   require: (module: 'electron') => {
	// 	ipcRenderer: IpcRenderer
	//   };
	// }
	interface Window extends Record<APIKey,API>{}
}
