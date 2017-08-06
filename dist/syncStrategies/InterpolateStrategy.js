'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SyncStrategy2 = require('./SyncStrategy');

var _SyncStrategy3 = _interopRequireDefault(_SyncStrategy2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
    syncsBufferLength: 6,
    clientStepHold: 6,
    reflect: false
};

var InterpolateStrategy = function (_SyncStrategy) {
    _inherits(InterpolateStrategy, _SyncStrategy);

    function InterpolateStrategy(clientEngine, inputOptions) {
        _classCallCheck(this, InterpolateStrategy);

        var options = Object.assign({}, defaults, inputOptions);

        var _this = _possibleConstructorReturn(this, (InterpolateStrategy.__proto__ || Object.getPrototypeOf(InterpolateStrategy)).call(this, clientEngine, options));

        _this.syncsBuffer = []; // buffer for server world updates
        _this.gameEngine = _this.clientEngine.gameEngine;
        _this.gameEngine.passive = true; // client side engine ignores inputs
        _this.gameEngine.on('client__postStep', _this.interpolate.bind(_this));
        _this.gameEngine.on('client__syncReceived', _this.collectSync.bind(_this));
        return _this;
    }

    _createClass(InterpolateStrategy, [{
        key: 'collectSync',
        value: function collectSync(e) {

            // TODO the event sorting code below is used in one way or another
            //    by interpolate, extrapolate and reflect.  Consider placing
            //    it in the base class.

            var lastSync = this.lastSync = {};
            lastSync.stepCount = e.stepCount;

            // keep a reference of events by object id
            lastSync.syncObjects = {};
            e.syncEvents.forEach(function (sEvent) {
                var o = sEvent.objectInstance;
                if (!o) return;
                if (!lastSync.syncObjects[o.id]) {
                    lastSync.syncObjects[o.id] = [];
                }
                lastSync.syncObjects[o.id].push(sEvent);
            });

            // keep a reference of events by step
            lastSync.syncSteps = {};
            e.syncEvents.forEach(function (sEvent) {

                // add an entry for this step and event-name
                if (!lastSync.syncSteps[sEvent.stepCount]) lastSync.syncSteps[sEvent.stepCount] = {};
                if (!lastSync.syncSteps[sEvent.stepCount][sEvent.eventName]) lastSync.syncSteps[sEvent.stepCount][sEvent.eventName] = [];
                lastSync.syncSteps[sEvent.stepCount][sEvent.eventName].push(sEvent);
            });

            var objCount = Object.keys(lastSync.syncObjects).length;
            var eventCount = e.syncEvents.length;
            var stepCount = Object.keys(lastSync.syncSteps).length;
            this.gameEngine.trace.debug('sync contains ' + objCount + ' objects ' + eventCount + ' events ' + stepCount + ' steps');

            this.syncsBuffer.push(lastSync);
            if (this.syncsBuffer.length >= this.options.syncsBufferLength) {
                this.syncsBuffer.shift();
            }
        }

        // add an object to our world

    }, {
        key: 'addNewObject',
        value: function addNewObject(objId, newObj, stepCount) {

            var curObj = new newObj.constructor();
            curObj.syncTo(newObj);
            curObj.passive = true;
            this.gameEngine.addObjectToWorld(curObj);
            console.log('adding new object ' + curObj);

            // if this game keeps a physics engine on the client side,
            // we need to update it as well
            if (this.gameEngine.physicsEngine && typeof curObj.initPhysicsObject === 'function') {
                curObj.initPhysicsObject(this.gameEngine.physicsEngine);
            }

            if (stepCount) {
                curObj.lastUpdateStep = stepCount;
            }

            return curObj;
        }

        /**
         * Perform client-side interpolation.
         */

    }, {
        key: 'interpolate',
        value: function interpolate() {
            var _this2 = this;

            // get the step we will perform
            var world = this.gameEngine.world;
            var stepToPlay = world.stepCount - this.options.clientStepHold;
            var nextSync = null;

            // get the closest sync to our next step
            for (var x = 0; x < this.syncsBuffer.length; x++) {
                if (this.syncsBuffer[x].stepCount >= stepToPlay) {
                    nextSync = this.syncsBuffer[x];
                    break;
                }
            }

            // we requires a sync before we proceed
            if (!nextSync) {
                this.gameEngine.trace.debug('interpolate lacks future sync - requesting step skip');
                this.clientEngine.skipOneStep = true;
                return;
            }

            this.gameEngine.trace.debug('interpolate past step [' + stepToPlay + '] using sync from step ' + nextSync.stepCount);

            // create objects which are created at this step
            var stepEvents = nextSync.syncSteps[stepToPlay];
            if (stepEvents && stepEvents.objectCreate) {
                stepEvents.objectCreate.forEach(function (ev) {
                    _this2.addNewObject(ev.objectInstance.id, ev.objectInstance, stepToPlay);
                });
            }

            // create objects for events that imply a create-object
            if (stepEvents && stepEvents.objectUpdate) {
                stepEvents.objectUpdate.forEach(function (ev) {
                    if (!world.objects[ev.objectInstance.id]) _this2.addNewObject(ev.objectInstance.id, ev.objectInstance, stepToPlay);
                });
            }

            // remove objects which are removed at this step
            if (stepEvents && stepEvents.objectDestroy) {
                stepEvents.objectDestroy.forEach(function (ev) {
                    if (world.objects[ev.objectInstance.id]) _this2.gameEngine.removeObjectFromWorld(ev.objectInstance.id);
                });
            }

            // interpolate values for all objects in this world
            world.forEachObject(function (id, ob) {

                var nextObj = null;
                var nextStep = null;

                // if we already handled this object, continue
                // TODO maybe call it lastUpdatedStep
                if (ob.lastUpdateStep === stepToPlay) return;

                // get the nearest object we can interpolate to
                if (!nextSync.syncObjects.hasOwnProperty(id)) return;

                nextSync.syncObjects[id].forEach(function (ev) {
                    if (!nextObj && ev.stepCount >= stepToPlay) {
                        nextObj = ev.objectInstance;
                        nextStep = ev.stepCount;
                    }
                });

                if (nextObj) {
                    var playPercentage = 1 / (nextStep + 1 - stepToPlay);
                    if (_this2.options.reflect) playPercentage = 1.0;
                    _this2.interpolateOneObject(ob, nextObj, id, playPercentage);
                }
            });

            // destroy objects
            world.forEachObject(function (id, ob) {
                var objEvents = nextSync.syncObjects[id];
                if (!objEvents || Number(id) >= _this2.gameEngine.options.clientIDSpace) return;

                objEvents.forEach(function (e) {
                    if (e.eventName === 'objectDestroy') _this2.gameEngine.removeObjectFromWorld(id);
                });
            });
        }

        // TODO: prevObj is now just curObj
        //       and playPercentage is 1/(nextObj.step - now)
        //       so the code below should be easy to simplify now

    }, {
        key: 'interpolateOneObject',
        value: function interpolateOneObject(prevObj, nextObj, objId, playPercentage) {

            // handle step for this object
            var curObj = this.gameEngine.world.objects[objId];
            if (typeof curObj.interpolate === 'function') {

                // update positions with interpolation
                this.gameEngine.trace.trace('object ' + objId + ' before ' + playPercentage + ' interpolate: ' + curObj.toString());
                curObj.interpolate(nextObj, playPercentage, this.gameEngine.worldSettings);
                this.gameEngine.trace.trace('object ' + objId + ' after interpolate: ' + curObj.toString());

                // if this object has a physics sub-object, it must inherit
                // the position now.
                if (curObj.physicalObject && typeof curObj.updatePhysicsObject === 'function') {
                    curObj.updatePhysicsObject();
                }
            }
        }
    }]);

    return InterpolateStrategy;
}(_SyncStrategy3.default);

exports.default = InterpolateStrategy;