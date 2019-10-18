const { ipcRenderer } = require('electron');
var tr = require('../common/api/trainings.js');

// global
const Global = {
  mode: 'anl'
}

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
function getDataFromLocal(path) {
  return tr.get_datas(path);
}

// 2. Store Functions
// Request to electron store using ipcRenderer (occurs ipcMain.on in main.js)
// will be split into different files

// Capsule store
function getCapsulesFromStore() {
  return ipcRenderer.sendSync('get-capsules');
} 
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
//////////////////////////////////////////////////////////////

// 3. Document Functions
function loadToNavigation() {
  // Get target(exist training datas) datas from TrainingStore
  // const capsules = getTrainingsFromStore();
  const capsules = getCapsulesFromStore ();

  // Add event to button
  DOCUMENT.addCapsuleButton.addEventListener('change', e => addCapsuleEvent(e));
  for (const capsuleName of capsules.list) {
    // const targetsOfCapsule = capsules[capsuleName].targets;

    const capsuleElement = makeCapsuleElement(capsuleName);
    DOCUMENT.capsulesElement.appendChild(capsuleElement);

    capsuleElement.querySelector('h3').addEventListener('click', e => {
      Global.capsule = e.target.innerText;
      if (e.target.parentElement.getAttribute('selected') === 'true') {
        resetSelected();
      } else {
        resetSelected();
        e.target.parentElement.setAttribute('selected', 'true');
      }
    });

    // Add events to element (delete capsule)
    capsuleElement.querySelector('span.delete-capslue-button').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
    const targetElements = capsuleElement.querySelectorAll("li.target[exist='true']")
    for (const targetElement of targetElements) {
      targetElement.addEventListener('click', e => {
        Global.target = e.target.innerText;
        const trainingInfos = getTrainingsFromStore (Global.capsule, Global.target);
        loadTrainings(e, trainingInfos);
      });
    };
  }

  activateSearchBar();
}

function loadTrainingInfos(trainingInfos) {
  for (const infoName of Object.keys(trainingInfos)) {
    const infoElement = document.createElement('li');
    infoElement.innerText = `${infoName}: ${trainingInfos[infoName]}`
    DOCUMENT.trainingInfos.appendChild(infoElement)
  }
}

function loadTrainings(e, trainingInfos) {
  clearTrainings();  // Reset training document
  loadTrainingInfos({ count: trainingInfos.length });

  trainingInfos.map(trainingInfo => {
    const trainingElement = document.createElement('li');
    if (Global.mode === 'anl') {
      trainingElement.innerText = trainingInfo.anl;
    } else {
      trainingElement.innerText = trainingInfo.nl;
    }

    DOCUMENT.trainings.appendChild(trainingElement);
  });
}

function clearTrainings() {
  DOCUMENT.trainings.innerHTML = '';
  DOCUMENT.trainingInfos.innerHTML = '';
}

function activateSearchBar() {
  DOCUMENT.searchBar.addEventListener('change', e => selectTrainings(e))
}

function makeCapsuleElement(capsuleName) {
  const capsule = getCapsuleFromStore(capsuleName);
  // capsule
  const capsuleElement = document.createElement('li');
  capsuleElement.setAttribute('class', 'capsule');

  // capsule name
  const capsuleNameElement = document.createElement('h3');
  capsuleNameElement.innerText = capsuleName;

  // capsule delete button
  const deleteCapsuleButtonElement = document.createElement('span');
  deleteCapsuleButtonElement.innerText = 'x';
  deleteCapsuleButtonElement.setAttribute('class', 'delete-capslue-button');

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

  capsuleElement.setAttribute('selected', 'false');
  capsuleElement.appendChild(capsuleNameElement); // capsule name
  capsuleElement.appendChild(deleteCapsuleButtonElement);
  capsuleElement.appendChild(targetsElement);     // capsule targets

  return capsuleElement;
}

function resetSelected () {
  [...document.querySelectorAll('li.capsule')].map(element => element.setAttribute('selected', 'false'));
}

// 4. Event Functions
function deleteCapsuleEvent(e, capsuleName) {
  // Delete capsule in store
  deleteCapsuleFromStore(capsuleName);
  deleteTrainingsFromStore(capsuleName);

  // Delete capsule in navigation
  const capsuleElement = e.target.parentElement;
  capsuleElement.parentElement.removeChild(capsuleElement);
  clearTrainings();
}

function addCapsuleEvent(e) {
  if (e.target.files.length > 0) {
    const capsulePath = e.target.files[0].path.replace(/\\/gi,'/');
    const capsuleName = capsulePath.slice(capsulePath.lastIndexOf('/') + 1, capsulePath.length);

    if (isExistCapsuleOf(capsuleName)) {
      addCapsuleToStore(capsuleName, capsulePath);
      addTrainingToStore(capsuleName, getDataFromLocal(capsulePath));
    
      const addedCapsule = getTrainingsFromStore()[capsuleName];
    
      const capsuleTargets = Object.keys(addedCapsule).map(target => {
        return {
          name: target,
          exist: addedCapsule[target].exist
        }
      });
    
      const capsuleElement = makeCapsuleElement(capsuleName);
      DOCUMENT.capsulesElement.appendChild(capsuleElement);
    
    
      capsuleElement.querySelector('h3').addEventListener('click', e => {
        Global.capsule = e.target.innerText;
        if (e.target.parentElement.getAttribute('selected') === 'true') {
          resetSelected();
        } else {
          resetSelected();
          e.target.parentElement.setAttribute('selected', 'true');
        }
      });
    
      // Add events to element (delete capsule)
      capsuleElement.querySelector('span.delete-capslue-button').addEventListener('click', e => deleteCapsuleEvent(e, capsuleName));
      const targetElements = capsuleElement.querySelectorAll("li.target[exist='true']")
      for (const targetElement of targetElements) {
        targetElement.addEventListener('click', e => {      
          Global.target = e.target.innerText;
          const trainingInfos = getTrainingsFromStore(Global.capsule, Global.target);  // params: capsule, target
          loadTrainings(e, trainingInfos);
        });
      };
    } else {
      console.log('Already exists capsule');
    }
  }

  e.target.value = '';
}

function selectTrainings(e) {
  const query = e.path[0].value;

  // Store로 부터 데이터 가져오기 
  // !우선 포함 여부만 검색
  const trainingInfos = getTrainingsFromStore(Global.capsule, Global.target, query);

  clearTrainings();
  loadTrainings(e, trainingInfos);
}

function refresh(e) {
  const trainingInfos = getTrainingsFromStore(Global.capsule, Global.target);
  loadTrainings(e, trainingInfos);
}

// 5. Common Functions 
function init() {
  // Load navigation
  loadToNavigation();

  document.getElementById('mode').addEventListener('change', e => {
    Global.mode = e.target.value;
    refresh(e);
  });
}