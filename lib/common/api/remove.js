var fs = require('fs');

function trashes(trashes) {
  const trashItems = Object.keys(trashes);

  for (let item of trashItems) {
    const fileName = trashItems[item];
    console.log(item, fileName);
    // Delete item(=trId) in find(fileName)
  }

  return {};
}

module.exports = {
  trashes,
};
