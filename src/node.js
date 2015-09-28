require('coffee-script/register')

global.THREE        = require('three')
global.THREE.Binder = require('../src/util/binder')

module.exports = require('./context')