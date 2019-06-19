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

class WebServer {
    /**
     *
     * @param options Webserver options
     * @param options.root Root of webserver, default is current working directory
     * @param cache Cache header of served files
     * @param middlewares Middleware list for webserver
     */
    constructor({ middlewares }) {
        // create connect framework instance
        const app = connect();

        // apply middlewares
        (middlewares || []).forEach(middleware => app.use(middleware));

        // attach connect to http server
        this._server = new http.createServer(app);
    }

    listen(port, host) {
        return new Promise((resolve, reject) => {
            this._server.listen(port, host, err => {
                if (err) {
                    return reject(err);
                }
                console.log(`Server is listening on http://${host}:${port}/`);
                resolve();
            });
        });
    }
}

module.exports = WebServer;
