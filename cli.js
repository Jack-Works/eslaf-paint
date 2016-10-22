#!/usr/bin/env node
'use strict'

const argv = require('minimist')(process.argv.slice(2))
require('./index.js')(...argv._)