const store = require('./api/store.js');
const training = require('./api/training.js');

const DOCUMENT = {
  capsules: document.getElementById('capsules'),
  targets: document.getElementById('targets'),
  addCapsuleButton: document.getElementById('file'),
  trainings: document.getElementById('trainings'),
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
  capsuleElement.innerText = capsuleName;

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
    const trainings = store.getTrainings(STATE.selectedCapsule, STATE.selectedTarget);

    trainings.forEach(training => {
      DOCUMENT.trainings.appendChild(makeTrainingElement(training));
    });
  }
}

function loadTargets() {
  clearTargetElements();
  if (STATE.selectedCapsule) {
    const targets = store.getTargetsOfCapsule(STATE.selectedCapsule);
    targets.forEach(target => {
      const targetElement = makeTargetElement(target);
      targetElement.addEventListener('click', e => {
        if (e.target.getAttribute('name') !== STATE.selectedTarget) {
          STATE.selectedTarget = e.target.getAttribute('name');
          // Reset selected & Apply new selected
          e.target.parentElement.querySelectorAll('li.target').forEach(element =>  element.setAttribute('selected', 'false'));
          e.target.setAttribute('selected', 'true');

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

function initContextMenuEvent() {
  document.body.addEventListener('click', e => {
    if (e.target.getAttribute('id') === 'capsuleContextMenu') {
      const capsuleName = e.target.getAttribute('from');
      deleteCapsule(capsuleName);
    }
    document.getElementById('capsuleContextMenu').style.display = 'none';
  });

  document.body.addEventListener('contextmenu', e => {
    if (e.target.parentElement.getAttribute('id') !== 'capsules') {
      document.getElementById('capsuleContextMenu').style.display = 'none';
    }
  });
}

function initDefaultEvent() {
  DOCUMENT.addCapsuleButton.addEventListener('change', e => {
    if (e.target.files.length > 0) {
      const capsulePath = e.target.files[0].path.replace(/\\/gi,'/');
      const capsuleName = capsulePath.slice(capsulePath.lastIndexOf('/') + 1, capsulePath.length);

      addCapsule(capsuleName, capsulePath)
    }
    e.target.value = '';
  })
}

loadCapsules();
initContextMenuEvent();
initDefaultEvent();