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
    if (arguments.length > 0) {
      return this.trainings[arguments[0]][arguments[1]];
    } else {
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