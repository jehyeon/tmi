var fs = require('fs');

// Refactor 예정

const debugMode = false;
// 모든 training.bxb 가져오기
function get_files_from(path) {
  return fs.readdirSync(path);
}

function get_raw_tr_data (file_name) {
  let start = false;
  let trainings = []; // in this file 
  let training;
  
  if (debugMode) {
    console.log(`Start load to ${file_name}`)
  }

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

  if (debugMode) {
    console.log (`Done (${file_name})`);
  }

  return trainings;
}

function peel(str, start, end) {
  return str.slice(str.indexOf(start) + 1,str.lastIndexOf(end));
}

function get_raw_tr_datas(path) {
  if (debugMode) {
    console.log (`Start load from ${path}`)
  }
  const targets = get_files_from(path);

  let datas = {};
  for (let target of targets) {
    datas[target] = {exist: false};
    // 해당 타겟에 학습 데이터가 존재하는 경우 exist: true
    if (get_files_from(`${path}/${target}`).find((element) => element === 'training')) {
      if (debugMode) {
        console.log (`${target}'s datas exists!\nLoad start`)
      }
      let all_trainings = {};
      
      // 해당 타겟의 모든 학습 데이터 저장
      for (let file of get_files_from(`${path}/${target}/training`)) {  // file of files
        all_trainings[file] = get_raw_tr_data(`${path}/${target}/training/${file}`);
      }

      datas[target].trainings = all_trainings;
      datas[target].exist = true;
      if (debugMode) {
        console.log(`Done (${target})`)
      }
    }
  }
  
  return datas;
}

function modifyToNL (anl) {
  const endOfGoal = anl.indexOf(']') + 1;

  const goal = anl.slice(0, endOfGoal);
  let nl = anl.replace(goal, '').trim();

  while (nl.indexOf(')[') != -1) {
    const start = nl.indexOf(')[');
    const end = nl.indexOf(']') + 1;
    if (start > end) {
      nl = 'stop!!' + anl;
      break;
    }
    nl = nl.replace(nl.slice(start, end), ' ').replace('(', '').replace('  ', ' ');
  }
  
  return nl;
}

function get_verify_training_datas (raw_tr_datas) {
  
  // raw_tr_datas: {
  //   fileName: [ raw_datas ... ],
  //   fileName: [ raw_datas ... ],
  //   fileName: [ raw_datas ... ],
  // }

  let verified = [];
  for (let fileName of Object.keys(raw_tr_datas)) {
    for (let raw_tr_data of raw_tr_datas[fileName]) {
      // Verify raw_data
      const raw_training = raw_tr_data.split('\n');
      const tr_id = peel(raw_training[0], '(', ')');
      let tr_uttr = peel(raw_training[1], '(', ')');
      if (tr_uttr.indexOf('"') > -1) {
        tr_uttr = peel(tr_uttr, '"', '"');
      }
      const tr_plan = peel(raw_training[2], '(', ')');
      // raw_training.length === 4: old data (excludes last-modified)
      const tr_last_modified = raw_training.length > 4
        ? peel(raw_training[3], '(', ')')
        : undefined;

      // Add to verified
      verified.push({
        id: tr_id,
        anl: tr_uttr,
        nl: modifyToNL(tr_uttr),
        plan: tr_plan,
        last_modified: tr_last_modified,
        file_name: fileName,
      });
    }
  }

  return verified;
}

function get_datas (path) {
  if (debugMode) {
    console.log (`Get training datas from ${path}/resources...`);
  }

  let all_datas = get_raw_tr_datas(`${path}/resources`);

  for (let target of Object.keys(all_datas)) {
    // 해당 타겟에 데이터가 존재하는 경우
    if (all_datas[target].exist) {
      if (debugMode) {
        console.log(`${target} is exists!!`);
      }
      all_datas[target]['verified'] = get_verify_training_datas(all_datas[target].trainings);
    }
  }

  return all_datas;
}

function convertItemsToDelete(trainingsToDeletes) {
  const result = {};
  trainingsToDeletes.forEach(training => {
    try {
      result[training.file].push(training.id)
    } catch {
      result[training.file] = [training.id] 
    }
  });
  
  return result;
}
function deleteTrainings(path, target, trainingsToDeletes) {
  console.log(path, target, trainingsToDeletes);
  
  const ItemsToDelete = convertItemsToDelete(trainingsToDeletes);
  Object.keys(ItemsToDelete).forEach(fileName => {
    const rawDatas = get_raw_tr_data(`${path}/resources/${target}/training/${fileName}`);
    const filteredData = rawDatas.map(rawData => {
      const id = peel(rawData.split('\n')[0], '(', ')');
      console.log(id);
      if (ItemsToDelete[fileName].indexOf(id) === -1) {
        return rawData;
      }
    }).filter(item => item != undefined).join('\n');
    
    fs.writeFileSync(`${path}/resources/${target}/training/${fileName}`, filteredData, 'utf8')
  });
}

module.exports = {
  get_datas,
  deleteTrainings,
};
