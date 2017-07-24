const generateTestTemplate = require('./generateTemplate');

function generateTemplatesByComponentsObj (componentsObj) {
    const componentsWithTestTemplate = componentsObj.map(componentObj => {
        const name = componentObj.name;
        const datas = componentObj.componentData;
        const path = componentObj.componentPath;

        const testTemplate = generateTestTemplate(name, datas, path);
        return Object.assign({}, componentObj, {
            testTemplate
        });
    });
    return componentsWithTestTemplate;
}

module.exports = generateTemplatesByComponentsObj;
