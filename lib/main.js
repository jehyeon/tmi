const { app, BrowserWindow, ipcMain } = require('electron');
// Import stores
const CapsuleStore = require('./stores/CapsuleStore');
const TrainingStore = require('./stores/TrainingStore');

function createWindow() { // 브라우저 창 생성
  let win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('lib/renderer/main.html');

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

const capsuleStore = new CapsuleStore({name: 'Capsules'});
const trainingStore = new TrainingStore({name: 'Training'});

// Receive message from renderer
// * capsules
ipcMain.on('get-capsules', (event) => {
  console.log('Receive message (get-capsules)');
  event.returnValue = capsuleStore.getCapsules();
});

ipcMain.on('add-capsule', (event, arg) => {
  console.log('Receive message (add-capsule)');
  capsuleStore.addCapsule(arg.name, arg.path);

  // 정상적으로 받았다고 reply -> render에서 예외 처리까지 
});

ipcMain.on('delete-capsule', (event, arg) => {
  console.log('Receive message (delete-capsule)');
  capsuleStore.deleteCapsule(arg.name);

  // 정상적으로 받았다고 reply -> render에서 예외 처리까지 
});

// * traings
ipcMain.on('get-trainings', (event) => {
  console.log('Receive message (get-capsules)');
  event.returnValue = trainingStore.getTrainings();
});

// will update to 
// get-training-capsule
// get-training-target

ipcMain.on('add-training', (event, arg) => {
  console.log('Receive message (add-training)');
  trainingStore.addTraining(arg.name, arg.training);

  // 정상적으로 받았다고 reply -> render에서 예외 처리까지 
});

ipcMain.on('delete-training', (event, arg) => {
  console.log('Receive message (delete-training)');
  trainingStore.deleteTraining (arg.name);

  // 정상적으로 받았다고 reply -> render에서 예외 처리까지 
});