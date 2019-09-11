const { ipcRenderer } = require('electron');
var tr = require('../common/api/trainings.js');

// DOCUNENTS
const DOCUMENT = {
  capsulesElement: document.getElementById('capsules'),
  trainings: document.getElementById('trainings'),
  trainingInfos: document.getElementById('training-infos'),
  addCapsuleButton: document.getElementById('file')   // 수정 예정
};

init ();

/*
 * Functions
 * 1. Local Functions
 * 2. Store Functions
 * 3. Document Functions
 * 4. Event Functions
 * 5. Common Functions
 */

// 1. Local Functions
const getDataFromLocal = path => tr.get_datas(path);

function modifyLocalData (path, modifiedDatas) {
  // Modify local data
}

// 2. Store Functions: Request to electron store using ipcRenderer (occurs ipcMain.on in main.js)
const getCapsulesFromStore = () => ipcRenderer.sendSync('get-capsules');

function addCapsuleToStore (capsuleName, capsulePath) {
  ipcRenderer.send('add-capsule', { capsuleName, capsulePath });
  // 현재 reply 구현 안 함
  // capsules에 있는 지 검사 -> 이미 있는 캡슐 pop-up 등
  // reply가 없거나 에러 발생 -> 예외 처리 
}

function deleteCapsuleFromStore (capsuleName) {
  // Remove to electron-store
  ipcRenderer.send('delete-capsule', { capsuleName });
}

// get_training
function getTrainingsFromStore () {
  const capsule = arguments.length > 0
    ? arguments[0]
    : undefined;

  const target = arguments.length > 1
    ? arguments[1]
    : undefined;

  const arg = capsule && target
    ? { capsule, target }
    : undefined;

  return ipcRenderer.sendSync('get-trainings', arg);
}

function addTrainingToStore (capsuleName, capsuleTrainings) {
  ipcRenderer.send('add-training', { capsuleName, capsuleTrainings });
}

// 3. Document Functions
function loadToNavigation () {
  // Get target(exist training datas) datas from TrainingStore
  const capsules = getTrainingsFromStore();

  // Add event to button
  DOCUMENT.addCapsuleButton.addEventListener('change', e => addCapsuleEvent(e));

  for (const capsuleName of Object.keys(capsules)) {
    const capsuleTargets = Object.keys(capsules[capsuleName]).map(target => {
      return {
        name: target,
        exist: capsules[capsuleName][target].exist
      }
    });

    const capsuleElement = makeCapsuleElement(capsuleName, capsuleTargets);
    DOCUMENT.capsulesElement.appendChild(capsuleElement);

    // Add events to element
    // ! 임시로 capsule name(h3)에 삭제 이벤트 추가 
    capsuleElement.querySelector('h3').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
    const targets = capsuleElement.querySelectorAll("li.target[exist='true']")
    for (const target of targets) {
      target.addEventListener('click', e => loadTrainings(e, capsuleName, target.innerText));
    };
  }
}

function loadTrainingInfos (trainingInfos) {
  clearTrainings()  // Reset training infos document

  for (const infoName of Object.keys(trainingInfos)) {
    const infoElement = document.createElement('li');
    infoElement.innerText = `${infoName}: ${trainingInfos[infoName]}`
    DOCUMENT.trainingInfos.appendChild(infoElement)
  }
}

function loadTrainings (e, capsuleName, targetName) {
  // Load training 
  const trainings = getTrainingsFromStore(capsuleName, targetName);
  loadTrainingInfos ({ count: trainings.verified.length });

  clearTrainings()  // Reset training document

  // verified 로드
  trainings.verified.map(training => {
    const trainingElement = document.createElement('li');
    trainingElement.innerText = training.uttr;

    DOCUMENT.trainings.appendChild(trainingElement);
  });
}

function clearTrainings () {
  DOCUMENT.trainings.innerHTML = '';
  DOCUMENT.trainingInfos.innerHTML = '';
}

function makeCapsuleElement (capsuleName, capsuleTargets) {
  // capsule
  const capsuleElement = document.createElement('li');
  capsuleElement.setAttribute('class', 'capsule');

  // capsule name
  const capsuleNameElement = document.createElement('h3');
  capsuleNameElement.innerText = capsuleName;

  // capsule targets
  const targetsElement = document.createElement('ul');
  targetsElement.setAttribute('class', 'targets');
  targetsElement.setAttribute('capsule', capsuleName);
  
  capsuleTargets.map(target => {
    // example target: {name: 'bixby-mobile', exist: true}
    const targetElement = document.createElement('li');
    targetElement.innerText = target.name;
    targetElement.setAttribute('class', 'target');
    targetElement.setAttribute('exist', target.exist);

    targetsElement.appendChild(targetElement);
  });

  capsuleElement.appendChild(capsuleNameElement); // capsule name
  capsuleElement.appendChild(targetsElement);     // capsule target

  return capsuleElement;
}

// 4. Event Functions
function deleteCapsuleEvent (e, capsuleName) {
  // Delete capsule from store
  deleteCapsuleFromStore(capsuleName);
  ipcRenderer.send('delete-trainings', { capsuleName }); // -> deleteTrainingsFromStore

  // Delete capsule from navigation
  const capsuleElement = e.target.parentElement;
  capsuleElement.parentElement.removeChild(capsuleElement);

  clearTrainings();
}

function addCapsuleEvent (e) {
  const capsulePath = e.target.files[0].path.replace(/\\/gi,'/');
  const capsuleName = capsulePath.slice(capsulePath.lastIndexOf('/') + 1, capsulePath.length);

  addCapsuleToStore (capsuleName, capsulePath);
  addTrainingToStore (capsuleName, getDataFromLocal(capsulePath));

  // ! store에 저장하자 마자 다시 가져오는 방식은 별로인 듯
  // ! argument 1인 경우도 추가하면 좋을 듯 -> getTrainingsFromStore (capsuleName)
  const addedCapsule = getTrainingsFromStore ()[capsuleName];

  const capsuleTargets = Object.keys(addedCapsule).map(target => {
    return {
      name: target,
      exist: addedCapsule[target].exist
    }
  });

  const capsuleElement = makeCapsuleElement(capsuleName, capsuleTargets);
  DOCUMENT.capsulesElement.appendChild(capsuleElement);

  // Add events to element (added capsule)
  // ! 임시로 capsule name(h3)에 삭제 이벤트 추가 
  capsuleElement.querySelector('h3').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
  const targetElements = capsuleElement.querySelectorAll("li.target[exist='true']")
  for (const targetElement of targetElements) {
    targetElement.addEventListener('click', e => loadTrainings(e, capsuleName, targetElement.innerText));
  };

}

// 5. Common Functions 
function init () {
  // Load navigation
  loadToNavigation ();
}