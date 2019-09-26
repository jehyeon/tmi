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
  constructor (settings) {
    super (settings);

    this.trainings = this.get('trainings') || {};
  }

  getTrainings () {
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

  saveTrainings () {
    this.set('trainings', this.trainings);

    return this;
  }

  addTraining (capsule, training) {
    this.trainings[capsule] = training;

    return this.saveTrainings();
  }

  deleteTraining (capsule) {
    delete this.trainings[capsule];

    return this.saveTrainings();
  }
}

module.exports = TrainingStore;

function search (trainingInfos, query) {
  return trainingInfos.verified.map(trainingInfo => {
    if (JSON.stringify(trainingInfo).replace(/ /gi, '').indexOf(query.replace(/ /gi, '')) > -1) {
      return trainingInfo;
    }
  }).filter(item => item !== undefined);
}