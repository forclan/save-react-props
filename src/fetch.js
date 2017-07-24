const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

const fs = require('fs');
const path = require('path');

const getData = fs.readFileSync(path.join(__dirname, '../assert/getData.js'));
const inject = fs.readFileSync(path.join(__dirname, '../assert/inject.js'));

const getDataStr = getData.toString();
const injectStr = inject.toString();

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

    async function getPropertiesResultByObjectId (objectId) {
        return await Runtime.getProperties({
            objectId: objectId,
            ownProperities: true
        });
    }

    async function getOwnEnumerablePropertiesByObjectId (objectId) {
        const ownProperities = await getPropertiesResultByObjectId(objectId);
        console.log('ownProperities', ownProperities);
        return ownProperities.result.filter(val => val.enumerable);
    }

    Console.messageAdded(val => {
        console.log(`console message:`, val);
    });
    await Page.enable();
    await Console.enable();

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
        expression: `_storage.getAllItemsByString()`,
        generatePreview: true,
        returnByValue: true
    };

    return new Promise((resolve, reject) => {
        Page.loadEventFired(async () => {
            console.log('loadEventFired', Date.now());
            console.log(`successfully loaded page: ${url}`);
            await sleep(1000);
            storageRemoteObj = await Runtime.evaluate(storageGetAllItems);
            const storageResultRemoteObj = storageRemoteObj.result.value;
            resolve(storageResultRemoteObj);
            protocol.close();
            chrome.kill();
        });
    });
}

module.exports = fetchPropsData;
