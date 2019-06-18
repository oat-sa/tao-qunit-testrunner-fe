const fs = require('fs');
const path = require('path');

module.exports = (options, req, res) => {
    if (req.method === 'POST' && req.url.endsWith('.json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        fs.readFile(path.join(options.root, req.url), (err, data) => {
            if (err) throw err;
            res.end(data.toString());
        });
    } else {
        res.emit('next');
    }
};
