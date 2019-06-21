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

const im = require('istanbul-lib-instrument');
const path = require('path');
const { readFile, writeFile, mkdirp } = require('fs-extra');
const crypto = require('crypto');
const minimatch = require('minimatch');

/**
 * Instrument source with istanbul
 * @param {string} file Path the file that should be instrumented
 * @returns {Promise<string>} resolves with the instrumented code
 */
const instrumentFile = async file => {
    const instrumenter = im.createInstrumenter();

    const content = await readFile(file);
    return new Promise(resolve => instrumenter.instrument(content.toString(), file, (err, code) => {
        if (err) {
            throw err;
        }
        resolve(code);
    }));
};

/**
 * Posts coverage info to the server.
 * Client code that will be injected.
 */
const postCoverageInfo = function() {
    QUnit.done(function() {
        if (window.__coverage__) {
            return fetch(`/__coverage__${window.location.pathname}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(window.__coverage__)
            });
        }
    });
};

/**
 * Save coverage info into disk using md5 hased filename
 * @param {string} name Name of coverage, that will be hashed
 * @param {object} info Coverage info
 * @param {options} options testrunner options
 * @returns {Promise<void>} Promise of coverage data is saved
 */
const saveCoverageInfo = (name, info, { root, coverageOutput }) => {
    const md5sum = crypto.createHash('md5').update(name);
    const coverageOutputDir = path.join(root, coverageOutput);
    return mkdirp(coverageOutputDir).then(function() {
        return writeFile(path.join(coverageOutputDir, `${md5sum.digest('hex')}.json`), JSON.stringify(info), 'utf8');
    });
};

/**
 * Inject coverage post stript to the file content
 * @param {string} file File path where post script should be injected
 * @returns {Promise<void>} Promise of script injected
 */
const injectPostScript = file => readFile(file).then(function(content) {
    return content.toString().replace(
        'QUnit.start();',
        `
        (${postCoverageInfo.toString()})();
        QUnit.start();
        `
    );
});

/**
 * Exports a middleware that instruments source files, inject coverage info post script
 * and saves received coverage info to the disk.
 * @param {object} options istanbul coverage options
 * @returns {function} Istanbul coverage middleware
 */
module.exports = options => (req, res, next) => {
    const { root, instrumentSpec, spec } = options;
    let coverageInfo, coverageName, sourceFile, htmlFile;

    switch (true) {
        // save posted coverage info
        case req.method.toLowerCase() === 'post' && req.url.startsWith('/__coverage__'):
            coverageInfo = req.body;
            coverageName = req.url;
            saveCoverageInfo(coverageName, coverageInfo, options)
                .then(() => {
                    res.end(JSON.stringify({ success: true }));
                })
                .catch(next);
            break;

        // instrument js files
        case minimatch(req.url.substr(1), instrumentSpec):
            sourceFile = path.join(root, req.url);
            instrumentFile(sourceFile)
                .then(res.end.bind(res))
                .catch(next);
            break;

        // inject coverage info post script to test html
        case minimatch(req.url.substr(1), spec):
            htmlFile = path.join(root, req.url);
            res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' });
            injectPostScript(htmlFile)
                .then(content => res.end(content))
                .catch(next);
            break;
        default:
            next();
    }
};
