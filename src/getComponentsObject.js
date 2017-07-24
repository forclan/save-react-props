function getComponentObj (components, componentsData) {
    const componentNames = Object.keys(components);
    const componentObj = componentNames.map(componentName =>
        generateComponentObj(
            componentName,
            components[componentName],
            componentsData
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