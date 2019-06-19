const im = require('istanbul-lib-instrument');
const path = require('path');
const { readFile, writeFile, mkdirp } = require('fs-extra');
const crypto = require('crypto');
const minimatch = require('minimatch');

/**
 * Instrument source with istanbul
 * @param {string} file Path the file that should be instrumented
 */
const instrumentFile = async file => {
    const instrumenter = im.createInstrumenter();

    const content = await readFile(file);
    return new Promise(resolve =>
        instrumenter.instrument(content.toString(), file, (err, code) => {
            if (err) {
                throw err;
            }
            resolve(code);
        })
    );
};

/**
 * Posts coverage info to the server.
 * Client code that will be injected.
 */
const postCoverageInfo = function() {
    QUnit.done(function() {
        if (window.__coverage__) {
            fetch('__coverage__', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(__coverage__)
            });
        }
    });
};

/**
 *
 * @param {string} name Name of coverage, that will be hashed
 * @param {object} info Coverage info
 * @param {options} options testrunner options
 */
const saveCoverageInfo = (name, info, { root, coverageOutput }) => {
    const md5sum = crypto.createHash('md5').update(name);
    const coverageOutputDir = path.join(root, coverageOutput);
    return mkdirp(coverageOutputDir).then(
        writeFile(path.join(coverageOutputDir, `${md5sum.digest('hex')}.json`), JSON.stringify(info), 'utf8')
    );
};

/**
 * Inject coverage post stript to the file content
 * @param {string} file File path where post script should be injected
 */
const injectPostScript = file =>
    readFile(file).then(content =>
        content.toString().replace(
            'QUnit.start();',
            `
            (${postCoverageInfo.toString()})();
            QUnit.start();
            `
        )
    );

module.exports = (options, req, res, next) => {
    const { root, sourceDir, spec } = options;

    switch (true) {
        // instrument js files from source directory
        case req.url.endsWith('.js') && req.url.startsWith(`/${sourceDir}`):
            const sourceFile = path.join(root, req.url);
            instrumentFile(sourceFile).then(res.end.bind(res));
            break;

        // save posted coverage info
        case req.method.toLowerCase() === 'post' && req.url.endsWith('__coverage__'):
            const coverageInfo = req.body;
            const coverageName = req.url;
            saveCoverageInfo(coverageName, coverageInfo, options).then(() => {
                res.end('{ "success" : true}');
            });
            break;

        // inject coverage info post script to test html
        case req.url.endsWith('.html') && minimatch(req.url, spec):
            const htmlFile = path.join(root, req.url);
            res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
            injectPostScript(htmlFile).then(content => res.end(content));
            break;
        default:
            next();
    }
};
