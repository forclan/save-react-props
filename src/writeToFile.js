const fs = require('fs');

function writeTestFile (filename, data) {
    if (typeof data !== 'string') {
        console.error(
            `data write to file should be string, input is ${typeof data}`
        );
        return;
    }

    const writeData = `
    // time: ${Date.now()}
    ${data}
    `;
    const isFileExists = fs.existsSync(filename);
    if (isFileExists) {
      filename = filename.replace(/\.test.js/, '1.test.js')
    }
    fs.writeFileSync(filename, writeData);
}

function getCurrentTime () {
    const rawStr = new Date().toJSON();
    const timeStr = rawStr.replace(/[:]/gi, '-');
    const timeInSec = timeStr.split('.')[0];
    return timeInSec;
}

// input should be string
function saveDataToFileByTime (data, fileName = getCurrentTime() + '.js') {
    const saveData = `
    module.exports = ${data}
    `;
    fs.writeFileSync(fileName, saveData);
}

module.exports = {
    writeTestFile,
    saveReactPropsData: saveDataToFileByTime
};
