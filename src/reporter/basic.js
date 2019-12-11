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
        switch (verbose) {
            case 0:
                if (result.stats.failed) {
                    process.stdout.write(chalk.redBright('F'));
                } else if (result.timeout) {
                    process.stdout.write(chalk.redBright('T'));
                } else {
                    process.stdout.write(chalk.green('.'));
                }
                break;
            case 1:
            case 2:
                if (result.stats.failed) {
                    console.log();
                    printFailedTests(result, verbose);
                } else if (result.timeout) {
                    process.stdout.write(chalk.redBright(`\nTimeout : ${result.path}\n`));
                } else {
                    process.stdout.write(chalk.greenBright('.'));
                }
                break;
            default:
                printDetailedResult(result, verbose);
                break;
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
 * Write test detailed result to the console
 * @param {object} result Test result
 * @param {number} verbose Verbose level
 */
function printDetailedResult(result, verbose) {
    const { modules } = result;
    if (result.stats.failed || result.timeout) {
        console.group(chalk.redBright(result.path));
    } else {
        console.group(chalk.greenBright(result.path));
    }
    Object.keys(modules).forEach(moduleName => {
        const moduleResult = modules[moduleName];
        console.group(moduleName);
        moduleResult.tests.forEach(test => {
            if (test.failed || verbose > 3) {
                console.group(test.name);

                (test.log || []).forEach(log => {
                    if ((test.failed && log.source) || verbose > 3) {
                        console.log(log.message);
                        if (log.source) {
                            console.log(log.source);
                        }
                    }
                });
                console.groupEnd();
            }
        });
        console.groupEnd();
    });
    console.groupEnd();
}
