const { ipcRenderer } = require('electron');

function getCapsulesFromStore() {
  return ipcRenderer.sendSync('get-capsules');
};

function getCapsuleFromStore(capsuleName) {
  return ipcRenderer.sendSync('get-capsule', { capsuleName });
} 

function addCapsuleToStore(capsuleName, capsulePath) {
  ipcRenderer.send('add-capsule', { capsuleName, capsulePath });
}

function deleteCapsuleFromStore(capsuleName) {
  ipcRenderer.send('delete-capsule', { capsuleName });
} 

// Training store
function getTrainingsFromStore() {
  const capsule = arguments.length > 0
    ? arguments[0]
    : undefined;

  const target = arguments.length > 1
    ? arguments[1]
    : undefined;

  const query = arguments.length > 2
    ? arguments[2]
    : undefined;

  return ipcRenderer.sendSync('get-trainings', { capsule, target, query });
}

function addTrainingToStore(capsuleName, capsuleTrainings) {
  ipcRenderer.send('add-training', { capsuleName, capsuleTrainings });
}

function deleteTrainingsFromStore(capsuleName) {
  ipcRenderer.send('delete-trainings', { capsuleName });
}

function isExistCapsuleOf(capsuleName) {
  if (getCapsuleFromStore(capsuleName)) {
    return false;
  }
  return true;
}

function getStatus() {
  return ipcRenderer.sendSync('get-status');
}

function addStatus(arg) {
  ipcRenderer.send('add-status', arg);
}

function updateStatus(arg) {
  ipcRenderer.send('update-status', arg);
}

function deleteStatus(arg) {
  ipcRenderer.send('delete-status', arg);
}

module.exports = {
  getStatus,
  addStatus,
  updateStatus,
  deleteStatus,
};
