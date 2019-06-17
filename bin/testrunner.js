#!/usr/bin/env node

const yargs = require('yargs');
const TestRunner = require('../src/testrunner');

yargs
    .usage('Usage: $0 [testName] [options]')
    .option('testDir', {
        alias: 'd',
        describe: 'test directory',
        default: 'test'
    })
    .option('root', {
        alias: 'r',
        describe: 'webserver root dir',
        default: process.cwd()
    })
    .option('spec', {
        describe: 'glob of test files',
        default: '**/test.html'
    })
    .option('middlewares', {
        alias: 'm',
        describe: 'list of webserver middlewares',
        choices: ['jsonPostMiddleware'],
        array: true
    })
    .help('h')
    .alias('h', 'help');

const { testDir, spec, root, middlewares } = yargs.argv;

const testRunner = new TestRunner({
    testDir,
    spec,
    root,
    webServer: {
        middlewares
    }
});

testRunner.run();
