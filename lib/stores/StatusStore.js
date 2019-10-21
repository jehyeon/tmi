const Store = require('electron-store');

class StatusStore extends Store {
  constructor(settings) {
    super (settings);
    this.status = this.get('status') || {};
  }

  getStatus() {
    return this.status;
  }

  saveStatus() {
    this.set('status', this.status);
    return this.status;
  }

  addStatus(arg) {
    this.status[arg.key] = arg.value;

    return this.saveStatus();
  }

  updateStatus(arg) {
    if (arg.key in this.status) {
      this.status[arg.key] = arg.value;
    }

    return this.saveStatus();
  }

  deleteStatus(arg) {
    delete this.status[arg.key];

    return this.saveStatus();
  }

  clearAllStatus() {
    this.status = {};

    return this.saveStatus();
  }
}

module.exports = StatusStore;
