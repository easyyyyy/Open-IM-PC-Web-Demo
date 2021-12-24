import { app, BrowserWindow, Menu } from "electron";
import * as path from "path";
import * as fs from "fs"
import * as isDev from "electron-is-dev";
import { spawn } from "child_process";
import { platform } from "process";

let win: BrowserWindow | null = null;
const appPath = app.getAppPath();
const userDataPath = app.getPath("userData");
const dbDataPath = `${userDataPath}/db`

const checkDir = () => {
  return new Promise<void>((resolve,reject)=>{
    fs.access(dbDataPath,(err)=>{
      if(err&&err.code=="ENOENT"){
        fs.mkdir(dbDataPath,()=>{
          resolve()
        })
      }else{
        resolve()
      }
    })
  })
}

async function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 980,
    height: 735,
    minWidth: 980,
    minHeight: 735,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
    // resizable:false,
    titleBarStyle: "hidden",
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    const electronPath = path.join(__dirname, "..", "..", "node_modules", "electron", "dist", "electron");
    try {
      require("electron-reload")(__dirname, {
        electron: electronPath,
        forceHardReset: true,
        hardResetMethod: "exit",
      });
    } catch (_) {}
  }

  // DevTools
  if (isDev) {
    win.webContents.openDevTools({
      mode: "detach",
    });
  }

  // localWs
  await checkDir();
  let exeType = "";
  if(platform==="darwin"){
    exeType = "localWs_mac"
  }else if(platform==="win32"){
    exeType = "localWs_win.exe"
  }
  const exPath = isDev ? `${__dirname}/../../electron/exec/${exeType}` : `${appPath}/../exec/${exeType}`;
  const dbDir = isDev? './':dbDataPath


  const localWs = spawn(exPath, ["-openIMApiAddress", "http://121.37.25.71:10000", "-openIMWsAddress", "ws://121.37.25.71:17778", "-sdkWsPort", "7788","-openIMDbDir",dbDir]);

  localWs.stdout.on("data", (data: Buffer) => {
    console.log("stdout:::::");
    console.log(data.toString());
  });
  localWs.stderr.on("data", (data: Buffer) => {
    console.log("stderr:::::");
    console.log(data.toString());
  });
  localWs.on("close", (code:number) => {
    console.log("close:::::");
    console.log(code);
  });
}

// ipcMain.on('login-resize',()=>{
//   win!.setSize(1050, 700)
// })

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
