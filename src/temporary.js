var fs = require('fs');

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
  for (line of datas.split('\n')) { // datas.split('\n'): lines
    if (!start && line.indexOf('train') > -1) {
      training = line + '\n';
      start = true;
    } else {
      training += line + '\n';
    }

    if (line.indexOf('}') > -1) {
      trainings.push(training);

      training = '';
      start = false;
    }    
  }

  return trainings;
}

// console.log(get_raw_training_datas('data.bxb'));