const store = require('./api/store.js');

const DOCUMENT = {
  capsules: document.getElementById('capsules'),
  targets: document.getElementById('targets'),
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

function clearTargetElements() {
  DOCUMENT.targets.innerHTML = '';
}

function clearCapsuleElements() {
  DOCUMENT.capsules.innerHTML = '';
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

function deleteCapsule(capsuleName) {
  store.deleteCapsule(capsuleName);
  if (STATE.selectedCapsule === capsuleName) {
    STATE.selectedCapsule = undefined;
    clearTargetElements();
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

loadCapsules();
initContextMenuEvent();
