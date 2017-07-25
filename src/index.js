#!/usr/bin/env node

var fetchReactProps = require('./fetch');
var readConfig = require('./readConfig');
var path = require('path');
const fs = require('fs');

var program = require('commander');
var savePropsData = require('./writeToFile').saveReactPropsData;
var saveTestFile = require('./writeToFile').writeTestFile;
const getComponentsObject = require('./getComponentsObject');
const generateTemplatesByComponentsObj = require('./generateTemplatesByComponentsObj');
const mapFnStrToFunction = require('./mapFnStrToFunction');

function mergeComponentData (componentDataArray) {
    let result = {};
    componentDataArray.map(componentsData => {
        let componentNames = Object.keys(componentsData);
        componentNames.map(componentName => {
            if (result[componentName]) {
                result[componentName].push(...componentsData[componentName]);
            } else {
                result[componentName] = componentsData[componentName];
            }
        });
    });
    return result;
}

(async function (params) {
    program
        .version('0.1.0')
        .usage('<file>')
        .option(
            '-c,  --config <path>',
            'js配置文件, 文件包含react component信息或者react component-data信息'
        )
        .option('-o, --output <outfilename>', '保存文件的名称')
        .option('-u, --url <url>', '想要获取数据的url')
        .parse(process.argv);

    if (!process.config) {
        console.error('未配置config文件');
        process.exit(0);
    }

    const configPath = path.resolve(program.config);
    const configDir = path.dirname(configPath);
    const config = readConfig(configPath);

    const urls = config.urls || [];
    const Components = config.Components || {};
    const dataFiles = config.dataFiles || [];

    if (urls.length === 0 && dataFiles.length === 0) {
        console.error('urls/dataFile必须配置其中至少一项');
        process.exit(0);
    }

    let componentsData;
    if (dataFiles.length > 0) {
        let dataContainer = [];
        for (let i = 0; i < dataFiles.length; i++) {
            let absoluteDataFile = path.join(
                path.dirname(configPath),
                dataFiles[i]
            );
            try {
                let tmpData = require(absoluteDataFile);
                dataContainer.push(tmpData);
            } catch (err) {
                console.error(err);
            }
        }
        componentsData = mergeComponentData(dataContainer);
    } else {
        let dataContainer = [];
        for (let i = 0; i < urls.length; i++) {
            let tmpComponentData = await fetchReactProps(urls[i]);
            dataContainer.push(JSON.parse(tmpComponentData));
        }
        componentsData = mergeComponentData(dataContainer);
        if (JSON.stringify(componentsData) === '{}') {
            console.log('从url地址获取的数据为空, 退出');
            process.exit(0);
        }
        savePropsData(JSON.stringify(componentsData), configDir);
    }

    if (!componentsData || JSON.stringify(componentsData) === '{}') {
        console.log('获取到的数据为空, 退出');
        process.exit(0);
    }

    if (JSON.stringify(Components) !== '{}') {
        const componentsObj = getComponentsObject(Components, componentsData);
        const componentsObjWithTest = generateTemplatesByComponentsObj(
            componentsObj
        );
        componentsObjWithTest.map(componentsObj => {
            let name = componentsObj.name;
            saveTestFile(
                `${configDir}/${name}.test.js`,
                componentsObj.testTemplate
            );
        });
    }
})();
