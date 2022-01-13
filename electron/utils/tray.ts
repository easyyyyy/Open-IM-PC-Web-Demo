import { app, BrowserWindow, Menu, Tray } from "electron";
import * as path from "path";

let appTray: Tray;
let timer: NodeJS.Timeout | null = null;
const emptyPic = path.join(__dirname, "../../icons/empty_tray.png");
const trayPic = path.join(__dirname, "../../icons/tray.png");

export const setTray = (win: BrowserWindow|null) => {
  const trayMenu = Menu.buildFromTemplate([
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  appTray = new Tray(trayPic);
  appTray.setToolTip("OpenIM");

  appTray.setContextMenu(trayMenu);

  appTray.on("click", function () {
    win?.show();
  });

  appTray.on("double-click", function () {
    win?.show();
  });

  win?.on("close",(e)=>{
    if(!win?.isVisible()){
			win = null;
		}else{
			e.preventDefault();
      win?.hide()
			// win?.minimize();
		}
  })
};

export const flickerTray = () => {
  let count = 0;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    count++;
    if (count % 2 == 0) {
      appTray.setImage(emptyPic);
    } else {
      appTray.setImage(trayPic);
    }
  }, 500);
};
