"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const pg_1 = require("pg");
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["DISCONNECTED"] = "DISCONNECTED";
    ConnectionStatus["CONNECTED"] = "CONNECTED";
    ConnectionStatus["ERROR"] = "ERROR";
})(ConnectionStatus || (ConnectionStatus = {}));
const db = (connection, logger = console) => {
    const isExternalClient = typeof connection === 'object' && 'query' in connection && typeof connection.query === 'function';
    let connectionStatus = ConnectionStatus.DISCONNECTED;
    const client = isExternalClient ? connection : new pg_1.Client(connection);
    const beforeCloseListeners = [];
    const createConnection = () => new Promise((resolve, reject) => {
        if (isExternalClient || connectionStatus === ConnectionStatus.CONNECTED) {
            resolve();
        }
        else if (connectionStatus === ConnectionStatus.ERROR) {
            reject(new Error('Connection already failed, do not try to connect again'));
        }
        else {
            client.connect((err) => {
                if (err) {
                    connectionStatus = ConnectionStatus.ERROR;
                    logger.error(`could not connect to postgres: ${(0, util_1.inspect)(err)}`);
                    return reject(err);
                }
                connectionStatus = ConnectionStatus.CONNECTED;
                return resolve();
            });
        }
    });
    const query = async (queryTextOrConfig, values) => {
        await createConnection();
        try {
            return await client.query(queryTextOrConfig, values);
        }
        catch (err) {
            const { message, position } = err;
            const string = typeof queryTextOrConfig === 'string' ? queryTextOrConfig : queryTextOrConfig.text;
            if (message && position >= 1) {
                const endLineWrapIndexOf = string.indexOf('\n', position);
                const endLineWrapPos = endLineWrapIndexOf >= 0 ? endLineWrapIndexOf : string.length;
                const stringStart = string.substring(0, endLineWrapPos);
                const stringEnd = string.substr(endLineWrapPos);
                const startLineWrapPos = stringStart.lastIndexOf('\n') + 1;
                const padding = ' '.repeat(position - startLineWrapPos - 1);
                logger.error(`Error executing:
${stringStart}
${padding}^^^^${stringEnd}

${message}
`);
            }
            else {
                logger.error(`Error executing:
${string}
${err}
`);
            }
            throw err;
        }
    };
    const select = async (queryTextOrConfig, values) => {
        const { rows } = await query(queryTextOrConfig, values);
        return rows;
    };
    const column = async (columnName, queryTextOrConfig, values) => {
        const rows = await select(queryTextOrConfig, values);
        return rows.map((r) => r[columnName]);
    };
    return {
        createConnection,
        query,
        select,
        column,
        connected: () => connectionStatus === ConnectionStatus.CONNECTED,
        addBeforeCloseListener: (listener) => beforeCloseListeners.push(listener),
        close: async () => {
            await beforeCloseListeners.reduce((promise, listener) => promise.then(listener).catch((err) => logger.error(err.stack || err)), Promise.resolve());
            if (!isExternalClient) {
                connectionStatus = ConnectionStatus.DISCONNECTED;
                client.end();
            }
        },
    };
};
exports.default = db;
