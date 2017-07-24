const fs = require('fs');

function writeFile(componentObj, data) {
  if (typeof data !== 'string') {
    console.error(`data write to file should be string, input is ${typeof data}`);
    return;
  }

  const writeData = `
  // dataFile: ${componentObj.dataFile}
  // time: ${Date.now()}
  ${data}
  `;
  const fileName = `${componentObj.name}.test.js`
  fs.writeFileSync(fileName, writeData);
}

module.exports = writeFile;