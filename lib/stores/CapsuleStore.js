const fs = require('fs');
const Store = require('electron-store');

class CapsuleStore extends Store {
  constructor(settings) {
    super (settings);
    this.capsules = this.get('capsules') || {list: []};
  }

  getCapsules() {
    return this.capsules;
  }

  getCapsule(capsuleName) {
    return this.capsules[capsuleName];
  }

  saveCapsules() {
    this.set('capsules', this.capsules);

    return this.capsules;
  }

  addCapsule(capsuleName, capsulePath) {
    this.capsules[capsuleName] = { 
      capsulePath,
      targets: getTargetsOfCapsuleFromLocal(capsulePath),
    };
    this.capsules.list.push(capsuleName);

    return this.saveCapsules();
  }

  deleteCapsule(capsuleName) {
    delete this.capsules[capsuleName];
    this.capsules.list.pop(capsuleName);

    return this.saveCapsules();
  }
}

module.exports = CapsuleStore;

// Functions
function getTargetsOfCapsuleFromLocal (capsulePath) {
  
  const targets = {}
  // in this 
  targets.list = fs.readdirSync(`${capsulePath}/resources`);
  
  targets.list.map(target => {
    if (fs.readdirSync(`${capsulePath}/resources/${target}`).find(element => element === 'training')) {
      targets[target] = {
        exist: true
      }
    } else {
      targets[target] = {
        exist: false
      }
    }
  });

  return targets;
}

// targetsOfCapsule
// targets: {
//   list: ['bixby-mobile', 'bixby-watch'],
//   'bixby-mobile': {
//     exist: true
//   }
//   'bixby-watch': {
//     exist: false
//   }
// }
