const store = require('./api/store.js');
const training = require('./api/training.js');

const DOCUMENT = {
  capsules: document.getElementById('capsules'),
  targets: document.getElementById('targets'),
  addCapsuleButton: document.getElementById('file'),
  trainings: document.getElementById('trainings'),
  modeButton: document.getElementById('mode'),
  searchBar: document.getElementById('searchQuery'),
  submit: document.getElementById('form'),
  deleteButton: document.getElementById('deleteButton'),
  deleteButtonText: document.getElementById('deleteButtonText'),
  allCheckBox: document.getElementsByClassName('all'),
};

const STATE = {};

function makeTargetElement(targetName) {
  const targetElement = document.createElement('li');
  targetElement.setAttribute('class', 'target');
  targetElement.setAttribute('name', targetName);
  targetElement.setAttribute('selected', 'false');
  targetElement.innerText = targetName;

  return targetElement;
}

function makeCapsuleElement(capsuleName) {
  const capsuleElement = document.createElement('li');
  capsuleElement.setAttribute('class', 'capsule');
  capsuleElement.setAttribute('name', capsuleName);
  capsuleElement.setAttribute('selected', 'false');
  capsuleElement.innerText = capsuleName[0].toUpperCase();

  const bubbleElement = document.createElement('span');
  bubbleElement.setAttribute('class', 'capsuleBubble');
  bubbleElement.innerText = capsuleName;

  capsuleElement.appendChild(bubbleElement);
  
  return capsuleElement;
}

function makeTrainingElement(trainingInfo) {
  const trainingElement = document.createElement('li');
  trainingElement.setAttribute('id', trainingInfo.id);
  trainingElement.setAttribute('fileName', trainingInfo.file_name);
  trainingElement.setAttribute('nl', trainingInfo.nl);
  trainingElement.setAttribute('anl', trainingInfo.anl);
  trainingElement.setAttribute('class', 'training');
  if (STATE.mode && STATE.mode === 'nl') {
    trainingElement.innerText = trainingInfo.nl;
  } else {
    trainingElement.innerText = trainingInfo.anl;
  }

  return trainingElement;
}

function clearSearchQuery() {
  DOCUMENT.searchBar.value = ''
  STATE.query = ''
}

function clearTrainingElements() {
  DOCUMENT.trainings.innerHTML = '';  
}

function clearTargetElements() {
  DOCUMENT.targets.innerHTML = '';
}

function clearCapsuleElements() {
  DOCUMENT.capsules.innerHTML = '';
}

function loadTrainings() {
  clearTrainingElements();
  if (STATE.selectedCapsule && STATE.selectedTarget) { 
    const trainings = STATE.query
      ? store.getTrainings(STATE.selectedCapsule, STATE.selectedTarget, STATE.query)
      : store.getTrainings(STATE.selectedCapsule, STATE.selectedTarget);

    trainings.forEach(training => {
      const trainingElement = makeTrainingElement(training);
      if (STATE.deleteMode) {
        trainingElement.addEventListener('click', e => {
          if (e.target.getAttribute('checked') === null) {
            e.target.setAttribute('checked', 'true');
          } else {
            e.target.removeAttribute('checked');
          }
        });
      }
      DOCUMENT.trainings.appendChild(trainingElement);
    });    
  }
  console.log(STATE);
}

function changeTarget() {
  clearSearchQuery(); // when target changed, reset searchQuery value
  ChangeDeleteButtonText(true);
}
function loadTargets() {
  clearTargetElements();
  if (STATE.selectedCapsule) {
    const targets = store.getTargetsOf(STATE.selectedCapsule);
    targets.forEach(target => {
      const targetElement = makeTargetElement(target);
      targetElement.addEventListener('click', e => {
        if (e.target.getAttribute('name') !== STATE.selectedTarget) {
          STATE.selectedTarget = e.target.getAttribute('name');
          // Reset selected & Apply new selected
          e.target.parentElement.querySelectorAll('li.target').forEach(element =>  element.setAttribute('selected', 'false'));
          e.target.setAttribute('selected', 'true');
          changeTarget();
          loadTrainings();
        }
      });      
      DOCUMENT.targets.appendChild(targetElement);
    });
  }
}

function loadCapsules() {
  clearCapsuleElements();
  const capsules = store.getCapsuleList();
  
  // Append capsule element to capsules element child
  capsules.forEach(capsule => {
    const capsuleElement = makeCapsuleElement(capsule);
    capsuleElement.addEventListener('click', e => {
      if (e.target.getAttribute('name') !== STATE.selectedCapsule) {
        STATE.selectedCapsule = e.target.getAttribute('name');
        // Reset selected & Apply new selected
        e.target.parentElement.querySelectorAll('li.capsule').forEach(element =>  element.setAttribute('selected', 'false'));
        e.target.setAttribute('selected', 'true');
        loadTargets(); 
      }
    });
    capsuleElement.addEventListener('contextmenu', e => {
      e.preventDefault();

      const contextMenuElement = document.getElementById('capsuleContextMenu');
      contextMenuElement.style.top = `${e.pageY}px`;
      contextMenuElement.style.left = `${e.pageX}px`;
      contextMenuElement.style.display = 'block';
      contextMenuElement.setAttribute('from', e.target.getAttribute('name'));
    });
    DOCUMENT.capsules.appendChild(capsuleElement);
  });

  if (STATE.selectedCapsule) {
    try {
      DOCUMENT.capsules.querySelector(`li.capsule[name=${STATE.selectedCapsule}]`).setAttribute('selected', 'true');
    } catch (e) {
      console.log(e);
    }
  }
}

function addCapsule(capsuleName, capsulePath) {
  if (store.getCapsuleList().indexOf(capsuleName) === -1) {
    store.addCapsule(capsuleName, capsulePath);

    const trainingInfos = training.get_datas(capsulePath);
    store.addTrainingInfos(capsuleName, trainingInfos);

    loadCapsules();
  }
}

function deleteCapsule(capsuleName) {
  store.deleteCapsule(capsuleName);
  store.deleteTrainings(capsuleName);
  if (STATE.selectedCapsule === capsuleName) {
    STATE.selectedCapsule = undefined;
    STATE.selectedTarget = undefined;
    clearTargetElements();
    clearTrainingElements();
  }
  loadCapsules();
}

function updateCapsule(capsuleName) {
  if (store.getCapsuleList().indexOf(capsuleName) > -1) {
    // capsuleName is in store
    const capsulePath = store.getCapsuleInfoOf(capsuleName).capsulePath;

    // Delete and re-add training datas
    store.deleteTrainings(capsuleName);
    const trainingInfos = training.get_datas(capsulePath);
    store.addTrainingInfos(capsuleName, trainingInfos);
  }

  // Reload trainings
  loadTrainings();
}

function initContextMenuEvent() {
  document.body.addEventListener('click', e => {
    if (e.target.getAttribute('class')) {
      // e.target's class is not null
      if (e.target.getAttribute('class').split(' ').includes('update-context-button')) {
        // Update capsule event
        const capsuleName = e.target.parentElement.parentElement.getAttribute('from');
        updateCapsule(capsuleName);
      } else if (e.target.getAttribute('class').split(' ').includes('delete-context-button')) {
        // Delete capsule event
        const capsuleName = e.target.parentElement.parentElement.getAttribute('from');
        // # to be update - https://github.com/jehyeon/tmi/issues/17
        deleteCapsule(capsuleName);
      }
    }

    // Hide contextMenu
    document.getElementById('capsuleContextMenu').style.display = 'none';
  });

  document.body.addEventListener('contextmenu', e => {
    if (e.target.parentElement.getAttribute('id') !== 'capsules') {
      // Hide contextMenu
      document.getElementById('capsuleContextMenu').style.display = 'none';
    }
  });
}

function deleteTrainings() {
  // Delete training datas
  const path = store.getCapsuleInfoOf(STATE.selectedCapsule).capsulePath;

  // item to delete (fileName, traingingId)
  const trianingsToDelete = [...document.querySelectorAll("li.training[checked='true'")].map(training => {
    return {
      id: training.getAttribute('id'),
      file: training.getAttribute('filename')
    };
  });

  // store
  store.deleteTraining(STATE.selectedCapsule, STATE.selectedTarget, trianingsToDelete);

  // document <- store에서 삭제 후 re-load 고려 안해도 됨

  // local
  training.deleteTrainings(path, STATE.selectedTarget, trianingsToDelete);

  return false;
}

function ChangeDeleteButtonText(reset = false) {
  if (reset === true) {
    STATE.deleteMode = false;
    DOCUMENT.deleteButton.style.background = '#fff';
  }
  console.log([...DOCUMENT.allCheckBox]);
  if (STATE.deleteMode) {
    DOCUMENT.deleteButtonText.innerText = 'Accept delete';
    DOCUMENT.deleteButton.style.background = 'pink';
    [...DOCUMENT.allCheckBox].forEach(element => element.style.display = 'inline-block');
  } else {
    DOCUMENT.deleteButtonText.innerText = 'Delete';
    DOCUMENT.deleteButton.style.background = '#fff';
    [...DOCUMENT.allCheckBox].forEach(element => element.style.display = 'none');
  }  
}
function initDefaultEvent() {
  // Add Capsule button event
  DOCUMENT.addCapsuleButton.addEventListener('change', e => {
    if (e.target.files.length > 0) {
      const capsulePath = e.target.files[0].path.replace(/\\/gi,'/');
      const capsuleName = capsulePath.slice(capsulePath.lastIndexOf('/') + 1, capsulePath.length);

      addCapsule(capsuleName, capsulePath)
    }
    e.target.value = '';
  });

  // ANL on/off button event
  DOCUMENT.modeButton.addEventListener('change', e => {
    if (e.target.checked === true) {
      STATE.mode = 'nl';
    } else {
      STATE.mode = 'anl';
    }
    loadTrainings()
  });

  // Search event
  DOCUMENT.submit.addEventListener('submit', e => {
    e.preventDefault();
    STATE.query = DOCUMENT.searchBar.value;
    loadTrainings();
    ChangeDeleteButtonText(true);   // if search training in delete mode, delete mode is canceled
  });

  // Delete mode event
  DOCUMENT.deleteButton.addEventListener('click', e => { 
    if (STATE.selectedCapsule && STATE.selectedTarget) {
      STATE.deleteMode = STATE.deleteMode
        ? deleteTrainings()
        : true;
      ChangeDeleteButtonText();
      loadTrainings();
    }
  });

  // All Check event
  document.getElementById('all').addEventListener('change', e => {
    if (e.target.checked === true) {
      [...document.querySelectorAll('li.training')].forEach(training => {
        training.setAttribute('checked', 'true');
      });
    } else {
      [...document.querySelectorAll('li.training')].forEach(training => {
        training.removeAttribute('checked');
      });
    }
  });
}

function initState() {
  STATE.mode = 'anl';
  STATE.deleteMode = false;
}

function main() {
  loadCapsules();
  initContextMenuEvent();
  initDefaultEvent();
  initState();
}

main();