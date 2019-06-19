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
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const bodyParser = require('body-parser');

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
            ...options
        };
        const middlewares = [
            bodyParser.json(),
            ...this.resolveMiddlewares(this.options),
            serveStatic(this.options.root),
            serveIndex(this.options.root)
        ];
        this._app = connect();
        middlewares.forEach(middleware => this._app.use(middleware));
        this._server = new http.createServer(this._app);
    }

    resolveMiddlewares(options) {
        const { root, middlewares } = options;
        return (middlewares || []).map(middleware => {
            if (typeof middleware === 'function') {
                return middleware.bind(null, options);
            }

            const middlewareModule = require(middleware.startsWith('.')
                ? path.resolve(root, middleware)
                : `./middleware/${middleware}`);
            return middlewareModule.bind(null, options);
        });
    }

    listen(port, host) {
        const { root } = this.options;
        return new Promise((resolve, reject) => {
            this._server.listen(port, err => {
                if (err) {
                    return reject(err);
                }
                console.log(`Server is listening on http://${host}:${port}/ and serving ${root}`);
                resolve();
            });
        });
    }
}

module.exports = WebServer;
