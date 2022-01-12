export type APIKey = "electron";
export type API = {
  getLocalWsAddress: () => string;
  getIMConfig: () => any;
  setIMConfig: (config:any) => void;
  focusHomePage: () => void;
};
