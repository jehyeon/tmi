const { ipcRenderer } = require('electron');
var tr = require('../common/api/trainings.js');

// DOCUNENTS
const DOCUMENT = {
  capsulesElement: document.getElementById('capsules'),
  trainings: document.getElementById('trainings'),
  trainingInfos: document.getElementById('training-infos'),
  addCapsuleButton: document.getElementById('file'),  // 수정 예정
  searchBar: document.getElementById('search-bar')
};

init ();
/*
 * Functions
 * 1. Store Functions
 * 3. Document Functions
 * 4. Event Functions
 * 5. Common Functions
 */

// 1. Local Functions -> to be in store 
function getDataFromLocal (path) {
  return tr.get_datas(path);
}

// 2. Store Functions
// Request to electron store using ipcRenderer (occurs ipcMain.on in main.js)

// Capsule store
function getCapsulesFromStore () {
  return ipcRenderer.sendSync('get-capsules');
} 
function getCapsuleFromStore (capsuleName) {
  return ipcRenderer.sendSync('get-capsule', { capsuleName });
} 

function addCapsuleToStore (capsuleName, capsulePath) {
  ipcRenderer.send('add-capsule', { capsuleName, capsulePath });
  // 현재 reply 구현 안 함
  // capsules에 있는 지 검사 -> 이미 있는 캡슐 pop-up 등
  // reply가 없거나 에러 발생 -> 예외 처리 
}

function deleteCapsuleFromStore (capsuleName) {
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

  const query = arguments.length > 2
    ? arguments[2]
    : undefined;

  return ipcRenderer.sendSync('get-trainings', { capsule, target, query });
}

function addTrainingToStore (capsuleName, capsuleTrainings) {
  ipcRenderer.send('add-training', { capsuleName, capsuleTrainings });
}

// 3. Document Functions
function loadToNavigation () {
  // Get target(exist training datas) datas from TrainingStore
  // const capsules = getTrainingsFromStore();
  const capsules = getCapsulesFromStore ();

  // Add event to button
  DOCUMENT.addCapsuleButton.addEventListener('change', e => addCapsuleEvent(e));
  console.log(capsules);
  for (const capsuleName of capsules.list) {
    const targetsOfCapsule = capsules[capsuleName].targets;

    const capsuleElement = makeCapsuleElement(capsuleName);
    DOCUMENT.capsulesElement.appendChild(capsuleElement);

    // Add events to element
    // ! 임시로 capsule name(h3)에 삭제 이벤트 추가 
    capsuleElement.querySelector('h3').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
    const targets = capsuleElement.querySelectorAll("li.target[exist='true']")
    for (const target of targets) {
      target.addEventListener('click', e => {
        const trainingInfos = getTrainingsFromStore (capsuleName, target.innerText);
        loadTrainings(e, trainingInfos);
        activateSearchBar (capsuleName, target.innerText);
      });
    };
  }
}

function loadTrainingInfos (trainingInfos) {
  for (const infoName of Object.keys(trainingInfos)) {
    const infoElement = document.createElement('li');
    infoElement.innerText = `${infoName}: ${trainingInfos[infoName]}`
    DOCUMENT.trainingInfos.appendChild(infoElement)
  }
}

function loadTrainings (e, trainingInfos) {
  clearTrainings();  // Reset training document
  loadTrainingInfos ({ count: trainingInfos.length });

  trainingInfos.map(trainingInfo => {
    const trainingElement = document.createElement('li');
    trainingElement.innerText = trainingInfo.uttr;

    DOCUMENT.trainings.appendChild(trainingElement);
  });
}

function clearTrainings () {
  DOCUMENT.trainings.innerHTML = '';
  DOCUMENT.trainingInfos.innerHTML = '';
}

function activateSearchBar (capsule, target) {
  DOCUMENT.searchBar.addEventListener('change', e => selectTrainings(e, capsule, target))
}

function makeCapsuleElement (capsuleName) {
  const capsule = getCapsuleFromStore (capsuleName);
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
  
  capsule.targets.list.map(targetName => {
    const targetElement = document.createElement('li');
    targetElement.innerText = targetName;
    targetElement.setAttribute('class', 'target');
    targetElement.setAttribute('exist', capsule.targets[targetName].exist);

    targetsElement.appendChild(targetElement);
  })

  capsuleElement.appendChild(capsuleNameElement); // capsule name
  capsuleElement.appendChild(targetsElement);     // capsule targets

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

  // ! argument 1인 경우도 추가하면 좋을 듯 -> getTrainingsFromStore (capsuleName)
  const addedCapsule = getTrainingsFromStore ()[capsuleName];

  const capsuleTargets = Object.keys(addedCapsule).map(target => {
    return {
      name: target,
      exist: addedCapsule[target].exist
    }
  });

  const capsuleElement = makeCapsuleElement(capsuleName);
  DOCUMENT.capsulesElement.appendChild(capsuleElement);

  // Add events to element (added capsule)
  // ! 임시로 capsule name(h3)에 삭제 이벤트 추가 
  capsuleElement.querySelector('h3').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
  const targetElements = capsuleElement.querySelectorAll("li.target[exist='true']")
  for (const targetElement of targetElements) {
    targetElement.addEventListener('click', e => {
      const trainingInfos = getTrainingsFromStore(capsuleName, targetElement.innerText);  // params: capsule, target
      loadTrainings(e, trainingInfos);
      activateSearchBar (capsuleName, targetElement.innerText);   // params: capsule, target
    });
  };

}

function selectTrainings (e, capsule, target) {
  const query = e.path[0].value;

  // Store로 부터 데이터 가져오기 
  // !우선 포함 여부만 검색
  const trainingInfos = getTrainingsFromStore(capsule, target, query);

  clearTrainings ();
  loadTrainings (e, trainingInfos);
}

// 5. Common Functions 
function init () {
  // Load navigation
  loadToNavigation ();
}