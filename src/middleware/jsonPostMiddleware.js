const fs = require('fs');
const path = require('path');

module.exports = (options, req, res, next) => {
    if (req.method.toLowerCase() === 'post' && req.url.endsWith('.json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        fs.readFile(path.join(options.root, req.url), (err, data) => {
            if (err) {
                throw err;
            }
            res.end(data.toString());
        });
    } else {
        next();
    }
};
