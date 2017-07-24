const fs = require('fs');

function getComponentObj (jsonFile) {
  const rawJSONData = readJSONFile(jsonFile);
  const componentObj = parseJSONFile(rawJSONData);
  return componentObj;
}

function readJSONFile (jsonFile) {
    let data;
    try {
        data = fs.readFileSync(jsonFile);
    } catch (err) {
        console.error(err);
        console.error('jsonFile path is:', jsonFile);
        process.exit(0);
    }
    return data;
}

function parseJSONFile (rawJSONData) {
    let obj;
    try {
        obj = JSON.parse(rawJSONData);
    } catch (err) {
        console.error('could not parse rawJSONData', rawJSONData);
        process.exit(0);
    }

    const componentDatas = obj['componentData'];
    const componentPathObj = obj['componentPath'];

    const componentNames = Object.keys(componentPathObj);

    const componentObj = componentNames.map(componentName =>
        generateComponentObj(
            componentName,
            componentPathObj[componentName],
            componentDatas
        )
    );
    return componentObj;
}

function generateComponentObj (componentName, componentPath, allComponentData) {
    if (!componentName || !allComponentData || !componentPath) {
        return null;
    }

    const componentData = allComponentData[componentName];
    return {
        name: componentName,
        componentPath: componentPath,
        componentData
    };
}

module.exports = getComponentObj;