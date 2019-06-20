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

const fs = require('fs');
const path = require('path');

/**
 * Middleware that mock API response
 * @param {object} options API Mock middleware options
 * @param {string} options.root Path where files should be found
 * @returns {function} API Mock middleware
 */
module.exports = function(options) {
    const { root } = options;
    return function(req, res, next) {
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
};
