const { app, BrowserWindow, ipcMain } = require('electron');
// Import stores
const CapsuleStore = require('./stores/CapsuleStore');
const TrainingStore = require('./stores/TrainingStore');

const remove = require('./common/api/remove.js');

// for debug
const debugMode = true;

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
// Capsule
// For more information, check out `lib/stores/README.md`
ipcMain.on('get-capsules', (event) => {
  if (debugMode) {
    console.log('Receive message (get-capsules)');
  }

  event.returnValue = capsuleStore.getCapsules();
});

ipcMain.on('get-capsule', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (get-capsule)');
    console.log(arg);
  }

  event.returnValue = capsuleStore.getCapsule(arg.capsuleName);
});

ipcMain.on('add-capsule', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (add-capsule)');
    console.log(arg);
  }
  
  capsuleStore.addCapsule(arg.capsuleName, arg.capsulePath); 
});

ipcMain.on('delete-capsule', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (delete-capsule)');
    console.log(arg);
  }

  capsuleStore.deleteCapsule(arg.capsuleName);
});

// Training
ipcMain.on('get-trainings', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (get-trainings)');
    if (arg) {
      console.log(arg) 
    }
  }

  if (arg.capsule && arg.target && arg.query) {
    event.returnValue = trainingStore.getTrainings(arg.capsule, arg.target, arg.query);
  } else if (arg.capsule && arg.target) {
    event.returnValue = trainingStore.getTrainings(arg.capsule, arg.target);
  } else {
    event.returnValue = trainingStore.getTrainings();
  }
});

ipcMain.on('add-training', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (add-training)');
    console.log(arg);
  }
  trainingStore.addTraining(arg.capsuleName, arg.capsuleTrainings);
});

ipcMain.on('delete-trainings', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (delete-training)');
    console.log(arg);
  }
  trainingStore.deleteTrainings (arg.capsuleName);
  // local data도 삭제해야 함
  // save action에서 local 데이터 수정하는 것으로 수정하는 것이 좋아 보임
});

ipcMain.on('add-trash', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (add-trash)');
    console.log(arg);
  }
  // trainingInfo = { trainingId: fileName }
  trainingStore.addTrash(arg);
});

ipcMain.on('delete-trash', (event, arg) => {
  if (debugMode) {
    console.log('Receive message (delete-trash)');
    console.log(arg);
  }
  trainingStore.deleteTrash(arg);
});

ipcMain.on('apply-trainings', (event) => {
  if (debugMode) {
    console.log('Receive message (apply-training)');
  }
  const trashes = trainingStore.getTrash();
  if (trashes) {
    trainingStore.setTrash(remove.trashes(trashes));
  }
})