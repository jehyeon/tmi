const { app, BrowserWindow } = require('electron');

function createWindow() { // 브라우저 창 생성
  let win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('lib/renderer/index.html');

  // 개발자 도구 열기
  win.webContents.openDevTools();

  win.on('closed', () => {
    // 창이 여러개인 경우 배열을 사용
    win = null;
  });
}

app.on('ready', createWindow);

// 모든 창이 닫혔을 경우
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});