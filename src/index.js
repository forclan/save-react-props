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

(async function (params) {
    program
        .version('0.1.0')
        .usage('<file>')
        .option(
            '-c,  --config <path>',
            'js配置文件, 文件包含react component信息或者react component-data信息'
        )
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
    const dataFile = config.dataFile || '';

    if (urls.length === 0 && !dataFile) {
        console.error('urls/dataFile必须配置其中至少一项');
        process.exit(0);
    }

    let componentsData;
    if (dataFile) {
        let absoluteDataFile = path.join(path.dirname(configPath), dataFile);
        try {
            componentsData = require(absoluteDataFile);
        } catch (err) {
            console.error(err);
            process.exit(0);
        }
    } else {
        componentsData = await fetchReactProps(urls[0]);
        console.log('componentsData', componentsData);
        if (!componentsData) {
          console.log('从url地址获取的数据为空, 退出');
          process.exit(0);
        }
        savePropsData(componentsData);
        componentsData = JSON.parse(componentsData);
    }

    if ( !componentsData || JSON.stringify(componentsData) === '{}') {
      console.log('获取到的数据为空, 退出');
      process.exit(0);
    }

    if (JSON.stringify(Components) !== '{}') {
      const componentsObj = getComponentsObject(Components, componentsData);
      const componentsObjWithTest = generateTemplatesByComponentsObj(componentsObj);
      componentsObjWithTest.map(componentsObj => {
        let name = componentsObj.name;
        saveTestFile(`${configDir}/${name}.test.js`, componentsObj.testTemplate);
      });
    }

})();
