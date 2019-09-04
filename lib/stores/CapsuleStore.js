const Store = require('electron-store');

/*
  ex.
    capsules = {
      contactApp: {
        path: '...',
      }
    }
*/
class CapsuleStore extends Store {
  constructor (settings) {
    super (settings);

    this.capsules = this.get('capsules') || {};
  }

  getCapsules () {
    this.capsules = this.get('capsules') || {};

    return this;
  }

  saveCapsules () {
    this.set('capsules', this.capsules);

    return this;
  }

  addCapsule (capsule, path) {
    this.capsules[capsule] = { path };

    // for test
    console.log(this.capsules);

    return this.saveCapsules();
  }

  deleteCapsule () {

  }

  
}

module.exports = CapsuleStore;