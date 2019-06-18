const im = require('istanbul-lib-instrument');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const instrumentFile = file => {
    const instrumenter = im.createInstrumenter();

    return new Promise(resolve => {
        fs.readFile(file, 'utf-8', (err, content) => {
            console.log(`${file} : instrumented`);
            resolve(instrumenter.instrumentSync(content, file));
        });
    });
};

module.exports = (options, req, res, next) => {
    // console.log(req.url);
    if (req.url.endsWith('.js') && req.url.indexOf('exampleSrc') !== -1) {
        const file = path.join(options.root, req.url);
        return instrumentFile(file).then(res.end.bind(res));
    }

    if (req.method.toLowerCase() === 'get' && req.url.indexOf('__coverage__') !== -1) {
        const coverage = req.query.c;
        const coverageName = Object.keys(coverage)[0];
        const md5sum = crypto.createHash('md5').update(coverageName);
        fs.writeFile(
            path.join(options.root, '.nyc_output', `${md5sum.digest('hex')}.json`),
            req.query.c,
            'utf8',
            function(err) {
                if (err) {
                    return next(err);
                }
                res.end('{ "success" : true}');
            }
        );
        return;
    }

    next();
};
