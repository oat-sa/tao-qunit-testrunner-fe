#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const getPort = require('get-port');
const TestRunner = require('../src/testrunner');
const WebServer = require('../src/webserver');
const coverageMiddleware = require('../src/middleware/istanbulCoverage');
const apiMockMiddleware = require('../src/middleware/apiMock');

yargs
    .usage('Usage: $0 [options] [testName]')
    .option('config', {
        alias: 'c',
        default: '.qunit-testrunner.config.json',
        config: true
    })
    .option('test-dir', {
        alias: 'd',
        describe: 'Test directory name',
        default: 'test'
    })
    .option('root', {
        alias: 'r',
        describe: 'Root dir',
        default: process.cwd()
    })
    .option('spec', {
        describe: 'Test files glob',
        default: '**/test.html'
    })
    .option('mock-api', {
        describe: 'Enable API Mock middleware',
        default: false,
        boolean: true
    })
    .option('without-server', {
        default: false,
        describe: 'Do not start server',
        boolean: true
    })
    .option('reporter', {
        default: 'basic',
        describe: 'Test result reporter'
    })
    .option('verbose', {
        alias: 'v',
        describe: 'Verbose level',
        count: true
    })
    .option('listen', {
        alias: 'l',
        describe: 'Keepalive webserver',
        default: false,
        boolean: true
    })
    .option('host', {
        describe: 'Webserver host',
        default: '127.0.0.1'
    })
    .option('port', {
        alias: 'p',
        describe: 'Webserver port',
        number: true
    })
    .group(['listen', 'host', 'port'], 'Webserver options:')
    .option('coverage', {
        alias: 'cov',
        default: false,
        describe: 'Enable coverage measurement',
        boolean: true
    })
    .option('coverage-instrument-glob', {
        describe: 'Glob of source files that should be instrumented',
        default: 'src/**/*.js'
    })
    .option('coverage-output-dir', {
        describe: 'Output of coverage info',
        default: '.nyc_output'
    })
    .group(['coverage', 'coverage-instrument-glob', 'coverage-output-dir'], 'Coverage options:')
    .implies('coverage-output-dir', 'coverage')
    .implies('coverage-instrument-glob', 'coverage')
    .help('help')
    .alias('h', 'help');

const setupWebServer = options => {
    const {
        host,
        port,
        root,
        coverage,
        'coverage-instrument-glob': instrumentGlob,
        'coverage-output-dir': coverageOutput,
        'api-mock': apiMock,
        spec
    } = options;
    const middlewares = [];

    // add coverage middleware if measurement enabled
    if (coverage) {
        middlewares.push(
            coverageMiddleware({
                root,
                instrumentGlob,
                spec,
                coverageOutput
            })
        );
    }

    if (apiMock) {
        middlewares.push(
            apiMockMiddleware({
                root
            })
        );
    }

    const webServer = new WebServer({
        root,
        middlewares
    });

    return webServer.listen(port, host);
};

const setupTestRunner = options => {
    const { testDir, spec, root, host, port, reporter, verbose } = options;
    const testRunner = new TestRunner({
        testDir,
        spec,
        root,
        host,
        port,
        reporter,
        verbose
    });

    return testRunner.start();
};

const params = yargs.argv;
const { withoutServer, listen } = params;
let { port } = params;

if (params._[0]) {
    params.spec = path.join('**', params._[0], params.spec);
}

let flow = Promise.resolve();

if (!withoutServer) {
    if (!port) {
        flow = flow.then(getPort).then(port => {
            params.port = port;
        });
    }
    flow = flow.then(() => setupWebServer(params));
}

if (!listen) {
    flow = flow
        .then(() => setupTestRunner(params))
        .then(isSuccess => {
            process.exit(isSuccess ? 0 : 1);
        });
}
