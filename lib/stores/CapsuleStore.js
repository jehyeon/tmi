const Store = require('electron-store');

class CapsuleStore extends Store {
  constructor (settings) {
    super (settings);

    this.capsules = this.get('capsules') || {};
  }

  getCapsules () {
    this.capsules = this.get('capsules') || {};

    return this.capsules;
  }

  getCapsule (capsuleName) {
    
    return { capsuleName: this.get('capsules')[capsuleName] };
  }

  saveCapsules () {
    this.set('capsules', this.capsules);

    return this.capsules;
  }

  addCapsule (capsuleName, capsulePath, targetsOfCapsule) {
    this.capsules[capsuleName] = { 
      capsulePath,
      targets: targetsOfCapsule
    };

    return this.saveCapsules();
  }

  deleteCapsule (capsuleName) {
    delete this.capsules[capsuleName];

    return this.saveCapsules();
  }
}

module.exports = CapsuleStore;