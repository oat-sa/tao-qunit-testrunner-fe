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

/* eslint-disable no-console */

const chalk = require('chalk');

module.exports = {
    onTestDone(result, verbose) {
        if (result.stats.failed) {
            printFailedTests(result, verbose);
        } else {
            printDetailedResult(result);
        }
    },
    onDone() {
        console.log();
    }
};

/**
 * Write failed test details to the console
 * @param {object} result Test result
 * @param {number} verbose Verbose level
 */
function printFailedTests(result, verbose) {
    const { modules } = result;
    console.group(chalk.redBright(result.path));
    Object.keys(modules).forEach(moduleName => {
        const moduleResult = modules[moduleName];
        if (moduleResult.failed) {
            console.group(moduleName);
            moduleResult.tests.forEach(test => {
                if (test.failed) {
                    console.group(test.name);
                    (test.log || []).forEach(log => {
                        if (log.source) {
                            console.log(log.message);
                            if (verbose > 1) {
                                console.log(log.source);
                            }
                        }
                    });
                    console.groupEnd();
                }
            });
            console.groupEnd();
        }
    });
    console.groupEnd();
}

/**
 * Write test result statistics to the console
 * @param {object} result Test result
 */
function printDetailedResult(result) {
    const { stats } = result;
    if (result.stats.failed) {
        console.group(chalk.redBright(result.path));
    } else {
        console.group(chalk.greenBright(result.path));
        Object.entries(stats).forEach(([ key, value ]) => {
            console.log(`${key}:`, key === 'runtime' ? `${value}ms`: value);
        });
    }
    console.groupEnd();
}
