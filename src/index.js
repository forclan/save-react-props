const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

const fs = require('fs');
const path = require('path');

const getData = fs.readFileSync(path.join(__dirname, './getData.js'));
const inject = fs.readFileSync(path.join(__dirname, './inject.js'));
// const storage = fs.readFileSync(path.join(__dirname, './storage.js'));

const getDataStr = getData.toString();
const injectStr = inject.toString();
// const storageStr = storage.toString();

// input should be string
function saveDataToFileByTime (data) {
    const time = new Date().toLocaleDateString();
    const timeStr = time.replace(/\//g, '-');
    fs.writeFileSync(timeStr, data);
}
/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
function launchChrome (headless = true) {
    return chromeLauncher.launch({
        chromeFlags: ['--disable-gpu', headless ? '--headless' : '']
    });
}

function sleep (ms = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('timeout');
        }, ms);
    });
}

async function fetchPropsData (url) {
    const chrome = await launchChrome(false);

    const protocol = await CDP({
        port: chrome.port
    });

    const { Page, Runtime, Console } = protocol;

    Console.messageAdded(val => {
        console.log(`console message:`, val);
    });
    await Page.enable();
    await Console.enable();

    // Page.addScriptToEvaluateOnNewDocument({
    //     source: storageStr
    // });
    Page.domContentEventFired(() => {
        console.log('Page.domContentEventFired', Date.now());
    });
    Page.addScriptToEvaluateOnNewDocument({
        source: getDataStr
    });
    Page.addScriptToEvaluateOnNewDocument({
        source: injectStr
    });

    console.log('start nav', Date.now());
    const frameId = await Page.navigate({
        url
    });
    console.log('frameId is:', frameId);

    console.log(`navigator to ${url}`);

    const storageGetAllItems = {
        expression: `_storage.getAllItems()`,
        returnByValue: true
    };

    const getReactEnable = {
        expression: `__REACT_DEVTOOLS_GLOBAL_HOOK__`,
        returnByValue: true
    };

    Page.loadEventFired(async () => {
        console.log('loadEventFired', Date.now());
        // console.log('navi history', await Page.getNavigationHistory());
        console.log(`successfully loaded page: ${url}`);

        // const objid = propsResult.result.objectId;
        // console.log('objid', objid);
        // const props = Runtime.getProperties({
        //     objectId: objid,
        //     ownProperties: true
        // });
        // console.log('props from objid', objid);
        console.log('time start', Date.now());
        await sleep(1000);
        propsResult = await Runtime.evaluate(storageGetAllItems);
        console.log('time end', Date.now());
        // const reactGlobalHook = await Runtime.evaluate(getReactEnable);
        // console.log('react global: ', reactGlobalHook);
        console.log(propsResult);
        console.log('saving data to file');
        saveDataToFileByTime(JSON.stringify(propsResult['result']['value']));
        console.log('after kill');
        // protocol.close();
        // chrome.kill();
    });
}

const u =
    'http://10.6.131.79:9091/video/app/search/search/?iid=11027839375&ac=WIFI&ssmix=a&aid=32&app_name=video_article&device_platform=iphone&idfa=C2F1C8E5-998D-4E7F-B2ED-1761A3B7A33D&os_version=10.3.2&vid=AF0DD570-0F09-43B2-B604-CF754779A509&user_version=2.0.0&device_type=iPhone%2520SE&openudid=a616aaae3df892f756a823559a317b10c44275b6&ab_feature=z1&device_id=35126357715&ab_version=135628,135653,135100,133502&resolution=640*1136&ab_client=a1,f2,f7,e1&version_code=6.0.8&forum=1&channel=local_test&search_sug=1&from=video&keyword=%E6%BA%90%E4%BB%A3%E7%A0%81';
const r = 'http://todomvc.com/examples/react/';
const r1 = 'http://dreyescat.github.io/react-rating/';
const r2 = 'http://mzabriskie.github.io/react-example/';
fetchPropsData(r2);
// fetchPropsData('http://localhost:3000');
