import { app, BrowserWindow } from "electron";
import { join } from "path"

import autoUpdate from "../modules/autoUpdate"
import { openDevTools } from "../utils/devtools"
import { getIcon } from "../utils/icon"
import { ipcMainHandle } from "../utils/ipcMain"

const url = process.env["VITE_DEV_SERVER_URL"];

console.log("url",url);

// join(__dirname, "../preload/index.js")

const preload = join(__dirname, '../preload/index.js');

const createMainWin = (): BrowserWindow => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		icon: getIcon(),
		// 创建无边框窗口
		frame: false,
		webPreferences: {

			// 是否集成nodejs
			nodeIntegration: true,
			// 是否开启上下文隔离
			contextIsolation: true,
			preload: preload
		}
	});

	win.webContents.on("did-finish-load", () => {
		// 利用localStorage存储win.id
		win.webContents.executeJavaScript(`localStorage.setItem("electronMainWinId",${win.id})`);
		win?.webContents.send("main-process-message", new Date().toLocaleString());
	});



	if (url) {
		win.loadURL(url).finally(() => openDevTools(win));
	  } else {
		win.loadFile(join(__dirname, "../../../index.html"));
	  }


	// if (app.isPackaged) {
	// 	win.loadFile(join(__dirname, "../../../index.html"));
	// } else {


	// 	// const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;

	// 	win.loadURL(url).finally(() => openDevTools(win));
	// }

	/**
	 * 检查更新
	 */
	ipcMainHandle("checkUpdate", async () => {
		return await autoUpdate(win);
	});

	return win;
};

export default createMainWin;
