#!/usr/bin/env node

var fetchReactProps = require('./fetch');

var program = require('commander');

program.version('0.1.0')
.usage('<file>')
.parse(process.argv);

const url = program.args[0];

if (!url) {
  console.log('pleate provide url, input is', url);
  process.exit(0);
}

fetchReactProps(url);