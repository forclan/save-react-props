const TEMPLATE = `
describe('Article', () => {
    it('snapshot', () => {
        const component = renderer.create(<Article {...ArticleData} />);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
`;

function IT_TEMPLATE (componentName, componentData) {
    return `
    it('snapshot', () => {
      const componentData = ${JSON.stringify(componentData)};
      const component = renderer.create(<${componentName} {...{componentData}}/>)
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  `;
}

function DESCRIBE_TEMPLATE (componentName, componentDataArray, componentPath) {
    if (!Array.isArray(componentDataArray)) {
        console.error(
            `${componentName}: componentDataArray should be an array, input is: ${componentDataArray}`
        );
        return;
    }
    const itTemplates = componentDataArray.map(componentData =>
        IT_TEMPLATE(componentName, componentData)
    );
    const joinedItTemplate = itTemplates.join('\n');
    return `
      const React = require('react');
      const renderer = require('react-test-renderer');
      const ${componentName} = require('${componentPath}');
      describe('${componentName}', () => {
        ${joinedItTemplate}
      })
  `;
}

module.exports = DESCRIBE_TEMPLATE;