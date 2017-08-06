'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _types = require('./../serialize/types');

var _types2 = _interopRequireDefault(_types);

var _NetworkedEventFactory = require('./NetworkedEventFactory');

var _NetworkedEventFactory2 = _interopRequireDefault(_NetworkedEventFactory);

var _NetworkedEventCollection = require('./NetworkedEventCollection');

var _NetworkedEventCollection2 = _interopRequireDefault(_NetworkedEventCollection);

var _Utils = require('./../lib/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NetworkTransmitter {

    constructor(serializer) {
        this.serializer = serializer;

        this.registeredEvents = [];

        this.payload = [];

        this.serializer.registerClass(_NetworkedEventCollection2.default);

        this.registerNetworkedEventFactory('objectUpdate', {
            netScheme: {
                stepCount: { type: _types2.default.INT32 },
                objectInstance: { type: _types2.default.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('objectCreate', {
            netScheme: {
                stepCount: { type: _types2.default.INT32 },
                objectInstance: { type: _types2.default.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('objectDestroy', {
            netScheme: {
                stepCount: { type: _types2.default.INT32 },
                objectInstance: { type: _types2.default.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('syncHeader', {
            netScheme: {
                stepCount: { type: _types2.default.INT32 },
                fullUpdate: { type: _types2.default.UINT8 }
            }
        });
    }

    registerNetworkedEventFactory(eventName, options) {
        options = Object.assign({}, options);

        let classHash = _Utils2.default.hashStr(eventName);

        let networkedEventPrototype = function () {};
        networkedEventPrototype.prototype.classId = classHash;
        networkedEventPrototype.prototype.eventName = eventName;
        networkedEventPrototype.netScheme = options.netScheme;

        this.serializer.registerClass(networkedEventPrototype, classHash);

        this.registeredEvents[eventName] = new _NetworkedEventFactory2.default(this.serializer, eventName, options);
    }

    addNetworkedEvent(eventName, payload) {
        if (!this.registeredEvents[eventName]) {
            console.error(`NetworkTransmitter: no such event ${eventName}`);
            return null;
        }

        let stagedNetworkedEvent = this.registeredEvents[eventName].create(payload);
        this.payload.push(stagedNetworkedEvent);

        return stagedNetworkedEvent;
    }

    serializePayload() {
        if (this.payload.length === 0) return null;

        let networkedEventCollection = new _NetworkedEventCollection2.default(this.payload);
        let dataBuffer = networkedEventCollection.serialize(this.serializer);

        return dataBuffer;
    }

    deserializePayload(payload) {
        return this.serializer.deserialize(payload.dataBuffer).obj;
    }

    clearPayload() {
        this.payload = [];
    }

}
exports.default = NetworkTransmitter;