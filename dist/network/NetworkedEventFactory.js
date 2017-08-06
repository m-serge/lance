'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Serializable = require('./../serialize/Serializable');

var _Serializable2 = _interopRequireDefault(_Serializable);

var _Utils = require('./../lib/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NetworkedEventFactory {

    constructor(serializer, eventName, options) {
        options = Object.assign({}, options);

        this.seriazlier = serializer;
        this.options = options;

        this.eventName = eventName;
        this.netScheme = options.netScheme;
    }

    /**
     * Creates a new networkedEvent
     * @param {Object} payload an object representing the payload to be transferred over the wire
     * @return {Serializable} the new networkedEvent object
     */
    create(payload) {
        let networkedEvent = new _Serializable2.default();
        networkedEvent.classId = _Utils2.default.hashStr(this.eventName);

        if (this.netScheme) {
            networkedEvent.netScheme = Object.assign({}, this.netScheme);

            // copy properties from the networkedEvent instance to its ad-hoc netsScheme
            for (let property of Object.keys(this.netScheme)) {
                networkedEvent[property] = payload[property];
            }
        } else {
            // todo take care of the event where no netScheme is defined
        }

        return networkedEvent;
    }

}
exports.default = NetworkedEventFactory;