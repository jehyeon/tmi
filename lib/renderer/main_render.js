var tr = require('../common/api/trainings.js');
const path = 'C:/Users/LBuser/Documents/works/contactApp/resources';

// DOCUNENTS
const nav_element = document.getElementById('targets');
// console.log(tr.get_datas(path));

function init(path) {
  // store를 사용하도록 수정 예정
  // path 또한 따로 input을 받아서 사용할 예정
  datas = tr.get_datas(path); // temporary
  console.log(datas);
  for (let target of Object.keys(datas)) {
    let li = document.createElement('li');
    li.innerHTML = target;
    li.setAttribute('exist', datas[target].exist);
    nav_element.appendChild(li);
  }
}

// function refresh // tr.get_datas(path)로 데이터 store 데이터 치환 (혹은 업데이트)

init(path);