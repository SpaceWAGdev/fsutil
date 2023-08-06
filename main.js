const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const filesys = require('./filesystem');
const path = require('path')

const preloadScriptLocation = path.join(__dirname ,"preload.js");

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1200,
		height: 600,
		minWidth: 1200,
		minHeight: 400,
		webPreferences : {
			preload: preloadScriptLocation
		}
	});
	win.removeMenu();
	win.loadFile(path.join(__dirname, 'frontend', 'index.html'));

	// win.webContents.openDevTools();
}

app.whenReady().then(() => {
	ipcMain.handle('dialog:select-folder', filesys.HandleFolderDialog);
	ipcMain.handle('core:start', async (event, filters) =>{
		return await filesys.Start(filters);
	});
	ipcMain.handle('core:skip', async ()=> {
		return await filesys.Skip();
	})
	ipcMain.handle('core:delete', async () => {
		return await filesys.Delete();
	})
	ipcMain.handle('core:move', async () => {
		return await filesys.Move();
	})
	ipcMain.handle('dialog:open-file', async () => {
		return await filesys.OpenFile();
	})
	createWindow();
});