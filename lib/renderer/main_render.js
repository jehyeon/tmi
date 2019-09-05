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

  // Load capsule
  add_capsule (name, path);
  add_training (name, get_datas(path));
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

  // Add elements
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
  
  console.log(trainings);
  // trainings: { capsule_name: { targets... }, ... }
  for (let capsule of Object.keys(trainings)) {

    // capsule
    let li_capsule = document.createElement('li');
    li_capsule.setAttribute('class', 'capsule');

    // capsule name
    let header = document.createElement('h3');
    header.innerText = capsule;
    li_capsule.appendChild(header);

    // capsule targets
    let ul_targets = document.createElement('ul');
    ul_targets.setAttribute('class', 'targets');
    ul_targets.setAttribute('capsule', capsule);
    const targets = trainings[capsule]; // targets: { target: { trainings }, ... }
    for (let target of Object.keys(targets)) {
      let li_target = document.createElement('li');
      li_target.setAttribute('class', 'target');
      li_target.innerText = target;

      if (!targets[target].exist) {
        li_target.setAttribute('exist', 'false');
      } else {
        li_target.setAttribute('exist', 'true');
      }
      ul_targets.appendChild(li_target);
    }
    li_capsule.appendChild(ul_targets);

    NAV_CAPSULES.appendChild(li_capsule);  // NAV_TARGETS: <ul id="capsules"> ... </ul>
  }
  
  console.log();

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
// 클릭 이벤트 추가하기
// capsule (targets 펼치기), target(우측 페이지에 학습 데이터 보여주기) 

function temp (verified_trainings) {
  for (let tr of verified_trainings) {
    let li_tr = document.createElement('li');
    li_tr.innerText = tr.utter;
    
    MAIN_TRAININGS.appendChild(li.tr);
  }
}

load();
// temp();

function load_trainings (verified) {
  // 기존 html 초기화
  MAIN_TRAININGS.innerHTML = '';

  for (let tr of verified) {
    let li_tr = document.createElement('li');
    li_tr.innerText = tr.uttr;
    
    MAIN_TRAININGS.appendChild(li_tr);
  }
}
// Click event
// clicked target



// 업데이트 ? 새로고침 ?