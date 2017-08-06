'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Serializer = require('./../serialize/Serializer');

var _Serializer2 = _interopRequireDefault(_Serializer);

var _Serializable = require('./../serialize/Serializable');

var _Serializable2 = _interopRequireDefault(_Serializable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Defines a collection of NetworkEvents to be transmitted over the wire
 */
class NetworkedEventCollection extends _Serializable2.default {

    static get netScheme() {
        return {
            events: {
                type: _Serializer2.default.TYPES.LIST,
                itemType: _Serializer2.default.TYPES.CLASSINSTANCE
            }
        };
    }

    constructor(events) {
        super();
        this.events = events;
    }

}
exports.default = NetworkedEventCollection;