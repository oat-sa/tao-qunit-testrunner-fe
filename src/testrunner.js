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

const glob = require('glob-promise');
const path = require('path');
const { runQunitPuppeteer, printResultSummary, printFailedTests } = require('node-qunit-puppeteer');
const promiseLimit = require('promise-limit');
const getPort = require('get-port');

const WebServer = require('./webserver');
const limit = promiseLimit(process.env.PARALLEL_TESTS || 5);

class TestRunner {
    constructor(options) {
        this.options = options;
        this.webServer = new WebServer({
            ...options.webServer
        });
    }

    async listen(port) {
        if (!port) {
            port = await getPort();
        }
        this.options.port = port;
        return this.webServer.listen(port);
    }

    async collectTests(testSpec) {
        const { testDir, root } = this.options;
        const files = await glob(path.join(root, testDir, testSpec));
        return files.map(file => path.relative(root, file));
    }

    runTest(testPath) {
        const qunitArgs = {
            // Path to qunit tests suite
            targetUrl: `http://127.0.0.1:${this.options.port}/${testPath}`,
            // (optional, 30000 by default) global timeout for the tests suite
            timeout: 30000,
            // (optional, false by default) should the browser console be redirected or not
            redirectConsole: false,
            puppeteerArgs: [
                '--no-sandbox',
                '--disable-gpu',
                '--disable-popup-blocking',
                '--autoplay-policy=no-user-gesture-required'
            ]
        };

        return runQunitPuppeteer(qunitArgs);
    }

    displayOutput(result) {
        // if (TESTNAME === '*') {
        //     process.stdout.write('.');
        // } else {
        // process.stdout.write(`${testFile} `);
        printResultSummary(result, console);
        console.log();
        // }

        if (result.stats.failed > 0) {
            console.log(`\n${testFile}`);
            printFailedTests(result, console);
            hasFailed = true;
        }
    }

    async run(testName) {
        const tests = await this.collectTests(path.join('**', 'test.html'));
        await this.listen();
        Promise.all(tests.map(test => limit(() => this.runTest(test).then(result => this.displayOutput(result)))))
            .catch(e => console.error(e))
            .then(() => {
                process.exit();
            });
    }
}

module.exports = TestRunner;
