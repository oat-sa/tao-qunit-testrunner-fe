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

const connect = require('connect');
const http = require('http');
const path = require('path');

/**
 * Web server factory
 * @param {object} options Webserver options
 * @param {function[]} options.middlewares Middleware list for webserver
 * @returns {function} Web server
 */
module.exports = function({ middlewares }) {
    /**
     * Connect framework instance
     * @type {createServer.Server}
     * @private
     */
    const app = connect();

    // apply middlewares
    (middlewares || []).forEach(middleware => app.use(middleware));

    /**
     * Http server instance connected with connect framework instance
     * @type {Server}
     * @private
     */
    const server = new http.createServer(app);

    return {
        /**
         * Start webserver
         * @param {number} port Port where listen
         * @param {string} host Host where host
         * @param {string} testDir QUnit tests directory
         * @returns {Promise<void>} Promise about webserver listen
         */
        listen(port, host, testDir) {
            return new Promise((resolve, reject) => {
                server.listen(port, host, err => {
                    const testDirectory = path.normalize(`/${testDir || '/'}`);
                    if (err) {
                        return reject(err);
                    }
                    console.log(`Server is listening on http://${host}:${port}${testDirectory}`); // eslint-disable-line no-console
                    resolve();
                });
            });
        }
    };
};
