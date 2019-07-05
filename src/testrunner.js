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
const chalk = require('chalk');

const limit = promiseLimit(process.env.PARALLEL_TESTS || 5);

/**
 * Custom error for QUnit runner errors
 */
class QUnitRunnerError extends Error { // eslint-disable-line es/no-classes
    constructor(testFilePath, error) {
        super(error.message || error);
        this.path = testFilePath;
    }
}

/**
 * Test runner factory
 * @param {object} options Config of testRunner
 * @param {string} options.root Path of root directory
 * @param {string} options.reporter Path of custom reporter or name of one of the provided reporters
 * @param {string} options.spec Glob of tests
 * @param {string} options.testDir Name of the test directory in root
 * @param {string} options.host Hostname of test web server
 * @param {number} options.port Port of test web server
 * @param {number} options.verbose Verbose level
 * @returns {function} Testrunner
 */
module.exports = function testRunner(options) {
    const { root, reporter, spec, testDir, host, port, verbose } = options;

    /**
     * Module that makes report from tests results
     * @type {object}
     * @private
     */
    const reporterModule = require(reporter.startsWith('.') ? path.resolve(root, reporter) : `./reporter/${reporter}`);

    return {
        /**
         * Collect test file list
         * @returns {Promise<string[]>} Collected test files
         */
        async collectTests() {
            const files = await glob(path.join(root, testDir, spec));
            return files.map(file => path.relative(root, file));
        },

        /**
         * Run provided test
         * @param {string} testPath Path of test file
         * @returns {Promise<object>} Promise resolved with test result
         */
        runTest(testPath) {
            const qunitArgs = {
                // Path to qunit tests suite
                targetUrl: `http://${host}:${port}/${testPath}`,
                // (optional, 30000 by default) global timeout for the tests suite
                timeout: 30000,
                // (optional, false by default) should the browser console be redirected or not
                redirectConsole: process.env.REDIRECT_CONSOLE === 'true',
                puppeteerArgs: [
                    '--no-sandbox',
                    '--disable-gpu',
                    '--disable-popup-blocking',
                    '--autoplay-policy=no-user-gesture-required'
                ]
            };

            return runQunitPuppeteer(qunitArgs)
                .then(result => {
                    result.path = testPath;
                    return result;
                })
                .catch(e => {
                    throw new QUnitRunnerError(testPath, e);
                });
        },

        /**
         * Calls reporter with test result
         * @param {object} result Test result
         */
        onTestDone(result) {
            if (reporterModule) {
                reporterModule.onTestDone(result, verbose);
            }
        },

        /**
         * Inform reporter about all test finished
         */
        onDone() {
            if (reporterModule) {
                reporterModule.onDone(verbose);
            }
        },

        /**
         * Starts testing
         * @returns {Promise<boolean>} Has failed test
         */
        async start() {
            const tests = await this.collectTests();
            let hasFailed = false;
            return Promise.all(
                tests.map(test => limit(() => this.runTest(test).then(result => {
                    if (result.stats.failed) {
                        hasFailed = true;
                    }
                    this.onTestDone(result);
                })
                )
                )
            )
                .catch(e => {
                    if (e.path) {
                        console.error(chalk.redBright(e.path)); // eslint-disable-line no-console
                    }
                    console.error(e); // eslint-disable-line no-console
                })
                .then(() => {
                    this.onDone();
                })
                .then(() => !hasFailed);
        }
    };
};
