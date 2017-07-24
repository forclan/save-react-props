const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const format = data =>
    prettier.format(data, {
        singleQuote: true
    });
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
        filename = filename.replace(/\.test.js/, '1.test.js');
    }
    try {
        const formatedData = format(writeData);
        fs.writeFileSync(filename, formatedData);
    } catch (err) {
        fs.writeFileSync(filename, writeData);
    }
}

function getCurrentTime () {
    const rawStr = new Date().toJSON();
    const timeStr = rawStr.replace(/[:]/gi, '-');
    const timeInSec = timeStr.split('.')[0];
    return timeInSec;
}

// input should be string
function saveDataToFileByTime (data, fileDir = '', filename = getCurrentTime() + '.js') {
    console.log('fileDir', fileDir);
    const fileSaveTo = path.join(fileDir, filename);
    const saveData = `
    module.exports = ${data}
    `;
    try {
        const formatedData = format(saveData);
        fs.writeFileSync(fileSaveTo, formatedData);
    } catch (err) {
        fs.writeFileSync(fileSaveTo, saveData);
    }
}

module.exports = {
    writeTestFile,
    getCurrentTime,
    saveReactPropsData: saveDataToFileByTime
};
