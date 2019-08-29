var fs = require('fs');

const path = 'C:/Users/LBuser/Documents/works/contactApp/resources';

// 모든 training.bxb 가져오기
function get_files_path (path) {
  return fs.readdirSync(path);
}

function get_raw_training_datas (file_name) {
  let start = false;
  let trainings = []; // in this file 
  let training;
  
  const datas = fs.readFileSync (file_name, 'utf8');

  // trainings(array)에 추가
  for (let line of datas.split('\n')) { // datas.split('\n'): lines
    if (!start && line.indexOf('train') > -1) {
      training = line + '\n';
      start = true;
    } else {
      training += line + '\n';
    }

    if (line.indexOf('}') > -1) {
      trainings.push(training.slice(0,-1));

      training = '';
      start = false;
    }    
  }

  return trainings;
}

function peel(str, start, end) {
  return str.slice(str.indexOf(start) + 1,str.lastIndexOf(end));
}

function get_verify_training_datas (raw_datas) {
  let verified = [];
  for (let raw_data of raw_datas) {
    const raw_training = raw_data.split('\n');
    console.log(raw_training);
    // training id
    const tr_id = peel(raw_training[0], '(', ')');
    let tr_uttr = peel(raw_training[1], '(', ')');
    if (tr_uttr.indexOf('"') > -1) {
      tr_uttr = peel(tr_uttr, '"', '"');
    }
    console.log(tr_id);
    console.log(tr_uttr);
  }
}
// datas = {}
// // console.log(get_raw_training_datas('data.bxb'));
// for (let target of get_files_path(path)) {
//   // console.log(target);
//   datas[target] = {exist: false};
//   // 해당 타겟에 학습 데이터가 존재하는 경우 exist: true
//   if (get_files_path(`${path}/${target}`).find((element) => element === 'training')) {
//     let all_trainings = [];
    
//     // 해당 타겟의 모든 학습 데이터 저장
//     for (let file of get_files_path(`${path}/${target}/training`)) {  // file of files
//       let trainings = get_raw_training_datas(`${path}/${target}/training/${file}`);
//       all_trainings = all_trainings.concat(trainings);
//     }
//     datas[target].trainings = all_trainings;
//     datas[target].exist = true;
//   }

// }

// console.log(datas);
// console.log(JSON.stringify(datas));

get_verify_training_datas(get_raw_training_datas(`${path}/bixby-mobile-ko-KR/training/t-0.training.bxb`));