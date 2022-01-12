import { ipcMain } from "electron";
import { initLocalWs, killLocalWs } from ".";
import { win } from "../main";
import { getApiAddress, getWsAddress, getWsPort, setApiAddress, setWsAddress, setWsPort } from '../store'

ipcMain.on("GetIMConfig",(e)=>{
    const config = {
        IMApiAddress:getApiAddress(),
        IMWsAddress:getWsAddress(),
        IMWsPort:getWsPort()
    }
    e.returnValue = config;
})

ipcMain.on("SetIMConfig",(e,config)=>{
    setApiAddress(config.IMApiAddress);
    setWsAddress(config.IMWsAddress);
    setWsPort(config.IMWsPort);
    killLocalWs();
    initLocalWs();
})

ipcMain.on("FocusHomePage",(e)=>{
    win?.focus();
})