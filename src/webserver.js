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

const HttpServer = require('http-server');
const path = require('path');

class WebServer {
    /**
     *
     * @param options Webserver options
     * @param options.root Root of webserver, default is current working directory
     * @param cache Cache header of served files
     * @param middlewares Middleware list for webserver
     */
    constructor(options = {}) {
        this.options = {
            root: process.cwd(),
            cache: -1,
            before: this.resolveMiddlewares(options.middlewares || []),
            ...options
        };
        this._server = new HttpServer.createServer(this.options);
    }

    resolveMiddlewares(middlewares, options) {
        return middlewares.map(middleware => {
            if (typeof middleware === 'function') {
                return middleware.bind(null, options);
            }

            return require(path.resolve(__dirname, 'middleware', middleware)).bind(null, options);
        });
    }

    listen(port) {
        return new Promise((resolve, reject) => {
            this._server.listen(port, err => {
                if (err) {
                    return reject(err);
                }
                console.log(`Server is listening on http://127.0.0.1:${port}/ and serving ${this.root}`);
                resolve();
            });
        });
    }
}

module.exports = WebServer;
