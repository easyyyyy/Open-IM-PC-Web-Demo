const { contextBridge } = require('electron')
import { networkInterfaces } from 'os';
import type { API, APIKey } from '../../src/@types/api';

export const apiKey:APIKey = 'electron';

const inElectron = true

const getIP = () => {
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
    return ips[0];
}

export const api:API = {
    inElectron,
    getIP,
};


contextBridge.exposeInMainWorld(apiKey,api);
