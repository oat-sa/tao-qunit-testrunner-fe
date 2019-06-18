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
const { runQunitPuppeteer } = require('node-qunit-puppeteer');
const promiseLimit = require('promise-limit');

const limit = promiseLimit(process.env.PARALLEL_TESTS || 5);

class TestRunner {
    constructor(options) {
        this.options = options;
        const { reporter, root } = options;
        if (reporter) {
            this.reporter = require(reporter.startsWith('.') ? path.resolve(root, reporter) : `./reporter/${reporter}`);
        }
    }

    async collectTests() {
        const { testDir, root, spec } = this.options;
        const files = await glob(path.join(root, testDir, spec));
        return files.map(file => path.relative(root, file));
    }

    runTest(testPath) {
        const { host, port } = this.options;
        const qunitArgs = {
            // Path to qunit tests suite
            targetUrl: `http://${host}:${port}/${testPath}`,
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

        return runQunitPuppeteer(qunitArgs).then(result => {
            result.path = testPath;
            return result;
        });
    }

    onTestDone(result) {
        const { verbose } = this.options;
        if (this.reporter) {
            this.reporter.onTestDone(result, verbose);
        }
    }

    onDone() {
        const { verbose } = this.options;
        if (this.reporter) {
            this.reporter.onDone(verbose);
        }
    }

    async start() {
        const tests = await this.collectTests();
        let hasFailed = false;
        return Promise.all(
            tests.map(test =>
                limit(() =>
                    this.runTest(test).then(result => {
                        if (result.stats.failed) {
                            hasFailed = true;
                        }
                        this.onTestDone(result);
                    })
                )
            )
        )
            .catch(e => console.error(e))
            .then(() => {
                this.onDone();
            })
            .then(() => !hasFailed);
    }
}

module.exports = TestRunner;
