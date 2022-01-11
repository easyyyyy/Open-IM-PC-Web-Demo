import { openIMApiAddress, openIMWsAddress, sdkWsPort } from "../config";
const Store = require("electron-store");

const store = new Store();

export const setApiAddress = (address: string) => store.set("IMApiAddress", address);
export const setWsAddress = (address: string) => store.set("IMWsAddress", address);
export const setWsPort = (port: string) => store.set("IMWsPort", port);

export const getApiAddress = () => store.get("IMApiAddress") ?? openIMApiAddress;
export const getWsAddress = () => store.get("IMWsAddress") ?? openIMWsAddress;
export const getWsPort = () => store.get("IMWsPort") ?? sdkWsPort;
