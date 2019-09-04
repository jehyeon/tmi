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

    switch(arguments.length) {
      case 0:
        return this;
      case 1:
        // ['capsule']
        // 예외 처리 업데이트 필요
        return this.trainings[capsule];
      case 2:
        // ['capsule', 'target']
        return this.trainings[capsule][target];
      default:
        return this;
    }
  }

  saveTrainings () {
    this.set('trainings', this.trainings);

    return this;
  }

  updateTrainings (trainings) {
    this.trainings = trainings;

    return this.saveTrainings();
  }  
}

module.exports = TrainingStore;