'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Serializable = require('./../serialize/Serializable');

var _Serializable2 = _interopRequireDefault(_Serializable);

var _types = require('./../serialize/types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Defines a collection of NetworkEvents to be transmitted over the wire
 */
class NetworkedEventCollection extends _Serializable2.default {

    static get netScheme() {
        return {
            events: {
                type: _types2.default.LIST,
                itemType: _types2.default.CLASSINSTANCE
            }
        };
    }

    constructor(events) {
        super();
        this.events = events;
    }

}
exports.default = NetworkedEventCollection;