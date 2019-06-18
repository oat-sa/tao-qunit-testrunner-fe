const chalk = require('chalk');

module.exports = {
    onTestDone: (result, verbose) => {
        switch (verbose) {
            case 0:
                if (result.stats.failed) {
                    process.stdout.write(chalk.redBright('F'));
                } else {
                    process.stdout.write(chalk.green('.'));
                }
                break;
            case 1:
            case 2:
                if (result.stats.failed) {
                    console.log();
                    printFailedTests(result, verbose);
                } else {
                    process.stdout.write(chalk.greenBright('.'));
                }
                break;
            default:
                printDetailedResult(result, verbose);
                break;
        }
    },
    onDone: () => {
        console.log();
    }
};

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

function printDetailedResult(result, verbose) {
    const { modules } = result;
    if (result.stats.failed) {
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
