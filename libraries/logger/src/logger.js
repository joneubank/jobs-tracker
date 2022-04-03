"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
const winston_1 = require("winston");
const { combine, timestamp, colorize, printf } = winston_1.format;
const options = {
    format: combine(colorize(), timestamp(), printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        new winston_1.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        }),
        new winston_1.transports.File({ filename: 'debug.log', level: 'debug' }),
    ],
};
const logger = (0, winston_1.createLogger)(options);
if (process.env.NODE_ENV !== 'production') {
    logger.debug('[Logger] Logging initialized at debug level');
}
exports.default = (service) => {
    const buildServiceMessage = (...messages) => {
        const strings = messages.map((m) => (typeof m === 'object' ? JSON.stringify(m) : m));
        return `[${service}] ${strings.join(' - ')}`;
    };
    return {
        debug: (...messages) => logger.debug(buildServiceMessage(...messages)),
        info: (...messages) => logger.info(buildServiceMessage(...messages)),
        warn: (...messages) => logger.warn(buildServiceMessage(...messages)),
        error: (message, ...meta) => logger.error(buildServiceMessage(message), ...meta),
    };
};
