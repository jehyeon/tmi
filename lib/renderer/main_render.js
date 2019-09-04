var tr = require('../common/api/trainings.js');

const CapsuleStore = require('../stores/CapsuleStore');

// Stores
const capsuleStore = new CapsuleStore({ name: 'capsules' });

// DOCUNENTS
const targets = document.getElementById('targets');
const select_capsule = document.getElementById('file');
// console.log(tr.get_datas(path));

// Events
select_capsule.addEventListener('change', (e) => {
  const path = e.target.files[0].path.replace(/\\/gi,'/');
  // 해당 경로가 올바른 capsule 경로인지 확인해야 함.
  init(`${path}/resources`);
});


function init(path) {
  // store를 사용하도록 수정 예정
  // path 또한 따로 input을 받아서 사용할 예정
  datas = tr.get_datas(path); // temporary
  console.log(datas);
  for (let target of Object.keys(datas)) {
    let li = document.createElement('li');
    li.innerHTML = target;
    li.setAttribute('exist', datas[target].exist);
    targets.appendChild(li);
  }
}

function add_capsule (capsule_name, capsule_path) {
  // Add to electron-store
    // capsules에 있는 지 검사
  // Add elements
}

function delete_capsule (capsule_name) {
  // Remove to electron-store
  
  // Remove elements
}

function load_capsules () {
  // Get capsule datas from electron-store

  // Add elements
}

// 업데이트 ? 새로고침 ?
