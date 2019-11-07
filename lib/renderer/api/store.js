const { ipcRenderer } = require('electron');

function getCapsuleList() {
  // ! option param: order style
  return ipcRenderer.sendSync('get-capsules').list;
}
function getTargetsOfCapsule(capsuleName) {
  const capsuleInfo = ipcRenderer.sendSync('get-capsules')[capsuleName];
  const targets = capsuleInfo.targets.list;
  // Return only existing targets
  targets.forEach((target, index) => {
    if (capsuleInfo.targets[target].exist === false) {
      targets.splice(index, 1);
    }
  })

  return targets;
}

function deleteCapsule(capsuleName) {
  ipcRenderer.send('delete-capsule', { capsuleName });
} 

module.exports = {
  getCapsuleList,
  getTargetsOfCapsule,
  deleteCapsule,
};