var store = require('../common/api/store.js');

const DOCUMENT = {
  capsules: document.getElementById('capsules'),
};

function fillCapsules() {
  console.log(store.getStatus());
  store.addStatus({key: 'test_key', value: 'test_value'});
  console.log(store.getStatus());
  store.updateStatus({key: 'test_key', value: 'test_value2'});
  console.log(store.getStatus());
  store.deleteStatus({key: 'test_key'});
}

fillCapsules();