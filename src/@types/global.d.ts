declare global {
	interface Window {
	  require: (module: 'electron') => {
		ipcRenderer: IpcRenderer
	  };
		// electron:any
	}
}
