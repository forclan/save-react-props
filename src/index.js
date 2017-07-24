#!/usr/bin/env node

var fetchReactProps = require('./fetch');
var readConfig = require('./readConfig');
var path = require('path');

var program = require('commander');

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
    const config = readConfig(configPath);

    const urls = config.urls || [];
    const Components = config.Components || {};
    const dataFile = config.dataFile || '';

    if (urls.length === 0 && !dataFile) {
        console.error('urls/dataFile必须配置其中至少一项');
        process.exit(0);
    }

    let componentDatas;
    if (dataFile) {
        let absoluteDataFile = path.join(path.dirname(configPath), dataFile);
        try {
            componentDatas = require(absoluteDataFile);
        } catch (err) {
            console.error(err);
            process.exit(0);
        }
    } else {
        componentDatas = await fetchReactProps(urls[0]);
    }

    if ( !componentData || JSON.stringify(componentDatas) === '{}') {
      console.log('获取到的数据为空, 退出');
      process.exit(0);
    }

    console.log(program.config);
})();
