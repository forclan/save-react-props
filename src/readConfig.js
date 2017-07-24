function readConfig (path) {
  const data = require(path);
  return data;
}

module.exports = readConfig;