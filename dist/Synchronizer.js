'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _InterpolateStrategy = require('./syncStrategies/InterpolateStrategy');

var _InterpolateStrategy2 = _interopRequireDefault(_InterpolateStrategy);

var _ExtrapolateStrategy = require('./syncStrategies/ExtrapolateStrategy');

var _ExtrapolateStrategy2 = _interopRequireDefault(_ExtrapolateStrategy);

var _FrameSyncStrategy = require('./syncStrategies/FrameSyncStrategy');

var _FrameSyncStrategy2 = _interopRequireDefault(_FrameSyncStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const strategies = {
    extrapolate: _ExtrapolateStrategy2.default,
    interpolate: _InterpolateStrategy2.default,
    frameSync: _FrameSyncStrategy2.default
};

class Synchronizer {
    // create a synchronizer instance
    constructor(clientEngine, options) {
        this.clientEngine = clientEngine;
        this.options = options || {};
        if (!strategies.hasOwnProperty(this.options.sync)) {
            throw new Error(`ERROR: unknown synchronzation strategy ${this.options.sync}`);
        }
        this.syncStrategy = new strategies[this.options.sync](this.clientEngine, this.options);
    }
}
exports.default = Synchronizer;