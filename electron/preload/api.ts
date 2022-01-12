const { contextBridge } = require('electron')
import { ipcRenderer } from 'electron';
import { networkInterfaces } from 'os';
import type { API, APIKey } from '../../src/@types/api';
import { getWsPort } from '../store';

export const apiKey:APIKey = 'electron';

const getLocalWsAddress = () => {
    let ips = [];
    const intf = networkInterfaces();
    for (let devName in intf) {
        let iface = intf[devName];
        console.log(iface);

        for (let i = 0; i < iface!.length; i++) {
        let alias = iface![i];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
            ips.push(alias.address);
        }
        }
    }
    return `ws://${ips[0]}:${getWsPort()}`;
}

const getIMConfig = () => {
    return ipcRenderer.sendSync("GetIMConfig")
}

const setIMConfig = (config:any) => {
    ipcRenderer.send("SetIMConfig",config)
}

const focusHomePage = () => {
    ipcRenderer.send("FocusHomePage")
}

export const api:API = {
    getLocalWsAddress,
    getIMConfig,
    setIMConfig,
    focusHomePage
};


contextBridge.exposeInMainWorld(apiKey,api);
