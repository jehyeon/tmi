const { ipcRenderer } = require('electron');
var tr = require('../common/api/trainings.js');

// DOCUNENTS
const NAV_CAPSULES = document.getElementById('capsules');
const ADD_CAPSULE_BTN = document.getElementById('file');
const MAIN_TRAININGS = document.getElementById('trainings');

// EVENTS
ADD_CAPSULE_BTN.addEventListener('change', (e) => {
  // 추가된 casule 이름과 경로 
  const path = e.target.files[0].path.replace(/\\/gi,'/');
  const name = path.slice(path.lastIndexOf('/') + 1, path.length);

  // 해당 경로가 올바른 capsule 경로인지 확인해야 함

  // Update store
  add_capsule (name, path);
  add_training (name, get_datas(path));

  const capsule_trainings = get_trainings()[name];

  // Add element
  NAV_CAPSULES.appendChild(get_capsule_element(name, capsule_trainings));

  
  // header 클릭 시 삭제 이벤트 추가 (temporary)
  for (let capsule_header of document.querySelectorAll('li.capsule > h3')) {
    capsule_header.addEventListener('click', event => {
        const arg = {
          name: capsule_header.innerText  // : capsule name
        };
        // electron-store에서 지우기
        ipcRenderer.send('delete-capsule', arg);
        ipcRenderer.send('delete-training', arg);
    
        // DOCUMENT에서 지우기
        event.target.parentElement.parentElement.removeChild(event.target.parentElement);
        
        // 해당 트레이닝을 보고 있을 때만 초기화 해야함 (전체적인 리팩토링이 필요)
        MAIN_TRAININGS.innerHTML = '';
    });
  }

  // 학습 데이터가 존재하는 타겟 버튼에 이벤트 부여
  let targets = document.querySelectorAll(".target[exist='true']");
  for (let target of targets) {
    target.addEventListener('click', (event) => {
      const capsule_name = target.parentElement.getAttribute('capsule');
      const target_name = event.target.innerText;

      // 특정 타겟의 training 가져오기
      const verified = get_training(capsule_name, target_name).verified;

      // training 페이지 학습 로드
      load_trainings (verified);
    });
  }
});

function get_datas(path) {
  return tr.get_datas(path);
}

function add_capsule (capsule_name, capsule_path) {
  const capsule = {
    name: capsule_name,
    path: capsule_path
  };
  
  // Send message to main.js
  ipcRenderer.send('add-capsule', capsule);
    // 현재 reply 구현 안 함
    // capsules에 있는 지 검사 -> 이미 있는 캡슐 pop-up 등
    // reply가 없거나 에러 발생 -> 예외 처리 
}

function delete_capsule (capsule_name) {
  // Remove to electron-store
  
  // Remove elements
}

function get_capsules () {
  // Get capsule datas from electron-store
  const capsules = ipcRenderer.sendSync('get-capsules');

  return capsules;
}

function get_training (capsule, target) {
  const arg = {
    name: capsule,
    target: target
  }
  const trainings = ipcRenderer.sendSync('get-training', arg);

  return trainings;
}

function get_trainings () {
  // Get training datas from electron-store
  const trainings = ipcRenderer.sendSync('get-trainings');

  return trainings.trainings;
}

function add_training (capsule_name, capsule_training) {
  const training = {
    name: capsule_name,
    training: capsule_training
  };

  ipcRenderer.send('add-training', training);
}

function load() {
  // from electron-store
  const capsules = get_capsules();
  const trainings = get_trainings();
  
  // trainings: { capsule_name: { targets... }, ... }
  for (let capsule of Object.keys(trainings)) {
    NAV_CAPSULES.appendChild(get_capsule_element(capsule, trainings[capsule]));  // NAV_TARGETS: <ul id="capsules"> ... </ul>
  }

  // header 클릭 시 삭제 이벤트 추가 (temporary)
  for (let capsule_header of document.querySelectorAll('li.capsule > h3')) {
    capsule_header.addEventListener('click', event => {
        const arg = {
          name: capsule_header.innerText  // : capsule name
        };
        // electron-store에서 지우기
        ipcRenderer.send('delete-capsule', arg);
        ipcRenderer.send('delete-training', arg);
    
        // DOCUMENT에서 지우기
        event.target.parentElement.parentElement.removeChild(event.target.parentElement);
    });
  }

  // 학습 데이터가 존재하는 타겟 버튼에 이벤트 부여
  let targets = document.querySelectorAll(".target[exist='true']");
  for (let target of targets) {
    target.addEventListener('click', (event) => {
      const capsule_name = target.parentElement.getAttribute('capsule');
      const target_name = event.target.innerText;

      // 특정 타겟의 training 가져오기
      const verified = get_training(capsule_name, target_name).verified;

      // training 페이지 학습 로드
      load_trainings (verified);
    });
  }
  
}

load();
// temp();

function load_trainings (verified) {
  // 기존 html 초기화
  MAIN_TRAININGS.innerHTML = '';

  // verified 로드
  for (let tr of verified) {
    let li_tr = document.createElement('li');
    li_tr.innerText = tr.uttr;
    
    MAIN_TRAININGS.appendChild(li_tr);
  }
}

function load_capsules () {

}

function get_capsule_element (capsule_name, capsule_training) {
  // capsule
  let li_capsule = document.createElement('li');
  li_capsule.setAttribute('class', 'capsule');

  // capsule name
  let header = document.createElement('h3');
  header.innerText = capsule_name;
  li_capsule.appendChild(header);

  // capsule targets
  let ul_targets = document.createElement('ul');
  ul_targets.setAttribute('class', 'targets');
  ul_targets.setAttribute('capsule', capsule_name);

  // console.log(capsule_training);
  // targets: { target: { trainings }, ... }
  for (let target of Object.keys(capsule_training)) {
    let li_target = document.createElement('li');
    li_target.setAttribute('class', 'target');
    li_target.innerText = target;

    const existsTrainings = capsule_training[target].exist
      ? 'true'
      : 'false';  
    li_target.setAttribute('exist', existsTrainings);

    ul_targets.appendChild(li_target);
  }
  li_capsule.appendChild(ul_targets);

  return li_capsule;
}


// Functions
// function add_capsule (capsule) {

// }

// function delete_capsule (capsule) {

// }