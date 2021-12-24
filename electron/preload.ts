const { contextBridge, ipcRenderer } = require('electron')
import type { API, APIKey } from '../src/@types/api';

const apiKey: APIKey = 'electron';
const api: API = {};
const electronApi =  {
    ipcOnTest:(cb:(...args:any[])=>void)=>ipcRenderer.on("pathTest",cb),
    ipcSendTest:()=>ipcRenderer.emit("GetPath")
}

contextBridge.exposeInMainWorld('electron',electronApi);
