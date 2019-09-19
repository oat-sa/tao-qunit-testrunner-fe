#!/usr/bin/env node

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

const path = require('path');
const yargs = require('yargs');
const getPort = require('get-port');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const bodyParser = require('body-parser');
const { remove } = require('fs-extra');
const testRunnerFactory = require('../src/testrunner');
const webServerFactory = require('../src/webserver');
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
    .option('keepalive', {
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
    .group(['keepalive', 'host', 'port'], 'Webserver options:')
    .option('coverage', {
        alias: 'cov',
        default: false,
        describe: 'Enable coverage measurement',
        boolean: true
    })
    .option('coverage-instrument-spec', {
        describe: 'Glob of source files that should be instrumented',
        default: 'src/**/*.js'
    })
    .option('coverage-output-dir', {
        describe: 'Output of coverage info',
        default: '.nyc_output'
    })
    .group(['coverage', 'coverage-instrument-spec', 'coverage-output-dir'], 'Coverage options:')
    .help('help')
    .alias('h', 'help');

const setupWebServer = async (options) => {
    const {
        host,
        port,
        root,
        coverage,
        'coverage-instrument-spec': instrumentSpec,
        'coverage-output-dir': coverageOutput,
        'api-mock': apiMock,
        spec,
        keepalive
    } = options;
    const middlewares = [bodyParser.json({ limit: '50mb' })];

    // add coverage middleware if measurement enabled
    if (coverage) {
        await remove(coverageOutput);
        middlewares.push(
            coverageMiddleware({
                root,
                instrumentSpec,
                spec,
                coverageOutput
            })
        );
    }

    // add api mock middleware
    if (apiMock) {
        middlewares.push(
            apiMockMiddleware({
                root
            })
        );
    }

    // serve static files
    middlewares.push(serveStatic(root));

    // provide directory index if keepalive option set
    if (keepalive) {
        middlewares.push(serveIndex(root));
    }

    const webServer = webServerFactory({
        root,
        middlewares
    });

    return webServer.listen(port, host);
};

const setupTestRunner = options => {
    const { testDir, spec, root, host, port, reporter, verbose } = options;
    const testRunner = testRunnerFactory({
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
const { withoutServer, keepalive } = params;
let { port } = params;

if (params._[0]) {
    params.spec = path.join('**', params._[0], params.spec);
}

let flow = Promise.resolve();

if (!withoutServer) {
    if (!port) {
        flow = flow.then(getPort).then(freePort => {
            params.port = freePort;
        });
    }
    flow = flow.then(() => setupWebServer(params)
        .then(() => {
            const { host, testDir } = params;
            const testDirectory = path.normalize(`/${testDir || '/'}`);
            console.log(`Server is listening on http://${host}:${port}${testDirectory}`); // eslint-disable-line no-console
        })
    );
}

if (!keepalive) {
    flow = flow
        .then(() => setupTestRunner(params))
        .then(isSuccess => process.exit(isSuccess ? 0 : 1));
}

flow.catch(e => console.error(e)); // eslint-disable-line no-console
