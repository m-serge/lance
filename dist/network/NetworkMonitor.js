'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Measures network performance between the client and the server
 * Represents both the client and server portions of NetworkMonitor
 */
class NetworkMonitor {

    constructor() {
        // mixin for EventEmitter
        Object.assign(this, _eventemitter2.default.prototype);
    }

    // client
    registerClient(clientEngine) {
        this.queryIdCounter = 0;
        this.RTTQueries = {};

        this.movingRTTAverage = 0;
        this.movingRTTAverageFrame = [];
        this.movingFPSAverageSize = clientEngine.options.healthCheckRTTSample;
        this.clientEngine = clientEngine;
        clientEngine.socket.on("RTTResponse", this.onReceivedRTTQuery.bind(this));
        setInterval(this.sendRTTQuery.bind(this), clientEngine.options.healthCheckInterval);
    }

    sendRTTQuery() {
        // todo implement cleanup of older timestamp
        this.RTTQueries[this.queryIdCounter] = new Date().getTime();
        this.clientEngine.socket.emit('RTTQuery', this.queryIdCounter);
        this.queryIdCounter++;
    }

    onReceivedRTTQuery(queryId) {
        let RTT = new Date().getTime() - this.RTTQueries[queryId];

        this.movingRTTAverageFrame.push(RTT);
        if (this.movingRTTAverageFrame.length > this.movingFPSAverageSize) {
            this.movingRTTAverageFrame.shift();
        }
        this.movingRTTAverage = this.movingRTTAverageFrame.reduce((a, b) => a + b) / this.movingRTTAverageFrame.length;
        this.emit('RTTUpdate', {
            RTT: RTT,
            RTTAverage: this.movingRTTAverage
        });
    }

    // server
    registerPlayerOnServer(socket) {
        socket.on('RTTQuery', this.respondToRTTQuery.bind(this, socket));
    }

    respondToRTTQuery(socket, queryId) {
        socket.emit("RTTResponse", queryId);
    }

}
exports.default = NetworkMonitor;