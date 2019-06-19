const fs = require('fs');
const path = require('path');

/**
 * Middleware that mock API response
 * @param {string} options.root Path where files should be found
 */
module.exports = ({ root }) => (req, res, next) => {
    if (req.method.toLowerCase() === 'post' && req.url.endsWith('.json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        fs.readFile(path.join(root, req.url), (err, data) => {
            if (err) {
                throw err;
            }
            res.end(data.toString());
        });
    } else {
        next();
    }
};
