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

  addCapsule (name, path) {
    this.capsules[name] = { path };

    return this.saveCapsules();
  }

  deleteCapsule (name) {
    delete this.capsules[name];

    return this.saveCapsules();
  }
}

module.exports = CapsuleStore;