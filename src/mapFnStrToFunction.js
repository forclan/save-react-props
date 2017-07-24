function mapFnStrToFunction (input, mapFnTo = '__function') {
    if (input === null || input === undefined) {
        return input;
    }
    if (typeof input === 'function') {
        return function() {};
    }
    if (typeof input === 'number'){
        return input;
    }

    if (typeof input === 'string' && input === '__function') {
      return function () {};
    }
    if (Array.isArray(input)) {
        const transformPropertyWrapper = val => mapFnStrToFunction(val);
        return input.map(transformPropertyWrapper);
    }
    if (typeof input === 'object') {
        let result = {};
        Object.keys(input).map(key => {
            result[key] = mapFnStrToFunction(input[key]);
        })
        return result;
    }
}

module.exports = mapFnStrToFunction;