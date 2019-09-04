const Store = require('electron-store');

class TrainingStore extends Store {
  constructor (settings) {
    // Same as new Store (settings)
    super (settings);

    this.name = this.get('name') || '';
    this.trainings = this.get('trainings') || {};

    // if (this.targets)
    // for (let target of this.targets) {
    //   this.trainings[target] = this.get(target);
    // }
  }

  getTrainings (target) {
    this.trainings = this.get('trainings') || {};
    
    return this.trainings[target];
  }

  
}