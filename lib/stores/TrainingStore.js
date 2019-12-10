const Store = require('electron-store');

/*
  ex.
    trainings = {
      contactApp: {
        bixby-mobile-ko-KR: {
          trainings ...
        },
        bixby-watch-ko-KR: {
          trainings ...
        },
        ...
      },
      phoneApp: { ... },
      ...
    }
*/

class TrainingStore extends Store {
  constructor(settings) {
    super (settings);

    this.trainings = this.get('trainings') || {};
    this.trash = this.get('trash') || {};
  }

  getTrainings() {
    this.trainings = this.get('trainings') || {};

    // only 2 case
    switch (arguments.length) {
      case 3:
        // if query is empty, return all datas
        if (arguments[2] !== '') {
          return search(this.trainings[arguments[0]][arguments[1]], arguments[2]);
        }
      case 2:
        return this.trainings[arguments[0]][arguments[1]].verified;
      default:
        return this.trainings;
    }
  }

  saveTrainings() {
    this.set('trainings', this.trainings);

    return this;
  }

  addTraining(capsule, training) {
    this.trainings[capsule] = training;

    return this.saveTrainings();
  }

  deleteTrainings(capsule) {
    delete this.trainings[capsule];

    return this.saveTrainings();
  }

  deleteTraining(capsule, itemsToDelete) {
    // itemsToDelete.forEach(item => {

    // });
    
    // this.trainings[capsule]['verified'] 
  }

  getTrash() {
    return this.trash;  
  }

  saveTrash() {
    this.set('trash', this.trash);

    return this;
  }

  addTrash(trainingInfo) {
    // trainingInfo = { trainingId: fileName }
    this.trash.push(trainingInfo);

    return this.saveTrash();
  }

  deleteTrash(trashId) {
    delete this.trash[trashId]

    return this.saveTrash();
  }

  setTrash(trashes) {
    this.trash = trashes;

    return this.saveTrash();
  }
}

module.exports = TrainingStore;

function search(trainingInfos, query) {
  const options = query.split(',');
  if (options.length === 1 && query.indexOf(':') === -1) {
    // Search without option (NL) 
    return trainingInfos.verified.map(trainingInfo => {
      if (trainingInfo.nl.replace(/ /gi, '').indexOf(query.replace(/ /gi, '')) > -1) {
        return trainingInfo;
      }
    }).filter(item => item !== undefined);
  } else {
    let searchResult = trainingInfos.verified;
    for (const option of options) {
      const key = option.split(':')[0].trim();
      const value = option.split(':').length > 3
        ? option.split(':').slice(1,).join(':').trim()
        : option.split(':')[1].trim();
      
      switch (key) {
        case 'anl':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.anl.replace(/ /gi, '').toLowerCase().indexOf(value.replace(/ /gi, '').toLowerCase()) > -1) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined);
          break;
        case 'nl':
        searchResult = searchResult.map(trainingInfo => {
          if (trainingInfo.nl.replace(/ /gi, '').toLowerCase().indexOf(value.replace(/ /gi, '').toLowerCase()) > -1) {
            return trainingInfo;
          }
        }).filter(item => item !== undefined);          
          break;
        case 'g':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.goalInfo && trainingInfo.goalInfo.goal
              && trainingInfo.goalInfo.goal.replace(/ /gi, '').toLowerCase() === value.replace(/ /gi, '').toLowerCase()) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined);          
          break;
        case 'r':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.goalInfo && trainingInfo.goalInfo.route
              && trainingInfo.goalInfo.route.replace(/ /gi, '').toLowerCase() === value.replace(/ /gi, '').toLowerCase()) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined);          
          break;
        case 'node':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.goalInfo && trainingInfo.goalInfo.node
              && trainingInfo.goalInfo.node.replace(/ /gi, '').toLowerCase() === value.replace(/ /gi, '').toLowerCase()) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined); 
          break;
        case 'spec':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.goalInfo && trainingInfo.goalInfo.spec
              && trainingInfo.goalInfo.spec.replace(/ /gi, '').toLowerCase() === value.replace(/ /gi, '').toLowerCase()) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined);          
          break;
        case 'v':
          searchResult = searchResult.map(trainingInfo => {
            if (trainingInfo.values
              && JSON.stringify(trainingInfo.values).replace(/ /gi, '').toLowerCase().indexOf(value.replace(/ /gi, '').toLowerCase()) > -1) {
              return trainingInfo;
            }
          }).filter(item => item !== undefined);          
          break;
      }
    }
    
    return searchResult;
  }
}