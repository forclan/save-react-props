class Storage {
    constructor () {
        this._container = {};
        return this;
    }
    setItem (name, val) {
        if (!this._container[name]) {
            this._container[name] = [];
        }
        this._container[name].push(val);
    }
    getItem (name) {
        return this._container[name] || undefined;
    }

    keys () {
        return Object.keys(this._container);
    }

    getAllItems () {
        return this._container;
    }

    getAllItemsByString () {
        return JSON.stringify(transformProperty(this._container));
    }
}

function transformProperty (input, mapFnTo = '__function') {
    if (input === null || input === undefined) {
        return input;
    }
    if (typeof input === 'function') {
        return mapFnTo;
    }
    if (typeof input === 'number' || typeof input === 'string') {
        return input;
    }
    if (Array.isArray(input)) {
        const transformPropertyWrapper = val => transformProperty(val);
        return input.map(transformPropertyWrapper);
    }
    if (typeof input === 'object') {
        let result = {};
        Object.keys(input).map(key => {
            result[key] = transformProperty(input[key]);
        })
        return result;
    }
}

const _storage = new Storage();
window._storage = _storage;


window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    inject: function (methodFromReactDom) {
        window.ReactMethods = methodFromReactDom;

        if (ReactMethods.Reconciler) {
            let mountComponent = ReactMethods.Reconciler.mountComponent;
            ReactMethods.Reconciler.mountComponent = function () {
                let result = mountComponent.apply(this, arguments);
                injectMountFunction.apply(this, arguments);
                return result;
            };
        }
    }
};

function injectMountFunction (internalInstance, rootID, transaction, context) {
    const componentData = getData(internalInstance);
    if (isReactComponent(componentData)) {
        _storage.setItem(
            componentData.name,
            getEnumableDataInObject(componentData.props)
        );
    }
}

function isReactComponent (componentData) {
    if (
        componentData &&
        componentData.nodeType &&
        componentData.nodeType === 'Composite' &&
        componentData.name !== '_class'
    ) {
        return true;
    }
    return false;
}

function getEnumableDataInObject (obj) {
    let result = {};
    const keys = Object.keys(obj);
    keys.map(key => {
        result[key] = obj[key];
    });
    return result;
}
