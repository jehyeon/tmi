const fs = require('fs');
const Store = require('electron-store');

class CapsuleStore extends Store {
  constructor (settings) {
    super (settings);

    this.capsules = this.get('capsules') || {list: []};
  }

  getCapsules () {
    this.capsules = this.get('capsules') || {list: []};

    return this.capsules;
  }

  getCapsule (capsuleName) {
    
    return { capsuleName: this.get('capsules')[capsuleName] };
  }

  saveCapsules () {
    this.set('capsules', this.capsules);

    return this.capsules;
  }

  addCapsule (capsuleName, capsulePath) {
    this.capsules[capsuleName] = { 
      capsulePath,
      targets: getTargetsOfCapsuleFromLocal (capsulePath)
    };
    this.capsules.list.push(capsuleName);

    return this.saveCapsules();
  }

  deleteCapsule (capsuleName) {
    delete this.capsules[capsuleName];
    this.capsules.list.pop(capsuleName);

    return this.saveCapsules();
  }
}

module.exports = CapsuleStore;

// Functions
function getTargetsOfCapsuleFromLocal (capsulePath) {
  
  // in this 
  const list = fs.readdirSync(`${capsulePath}/resources`);
  
  const targets = list.map(target => {
    // try
    // except
    console.log(fs.readdirSync(`${capsulePath}/resources/${target}/training`).length > 0);
    console.log(fs.readdirSync(`${capsulePath}/resources/${target}/trainingd`).length > 0);
  })
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
