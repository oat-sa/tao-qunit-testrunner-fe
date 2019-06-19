const im = require('istanbul-lib-instrument');
const path = require('path');
const { readFile, writeFile } = require('fs-extra');
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
    return writeFile(path.join(root, coverageOutput, `${md5sum.digest('hex')}.json`), JSON.stringify(info), 'utf8');
};
module.exports = (options, req, res, next) => {
    const { root, sourceDir, spec } = options;

    // instrument js files from source directory
    if (req.url.endsWith('.js') && req.url.startsWith(`/${sourceDir}`)) {
        const file = path.join(root, req.url);
        return instrumentFile(file).then(res.end.bind(res));
    }

    // save posted coverage info
    if (req.method.toLowerCase() === 'post' && req.url.endsWith('__coverage__')) {
        const coverageInfo = req.body;
        const coverageName = req.url;
        saveCoverageInfo(coverageName, coverageInfo, options).then(() => {
            res.end('{ "success" : true}');
        });
        return;
    }

    // inject coverage info post script to test html
    if (req.url.endsWith('.html') && minimatch(req.url, spec)) {
        readFile(path.join(root, req.url)).then(content => {
            res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
            res.end(
                content.toString().replace(
                    '</body>',
                    `
                <script type="text/javascript">
                (${postCoverageInfo.toString()})();
                </script>
                </body>
            `
                )
            );
        });
        return;
    }

    next();
};
