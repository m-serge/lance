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
    syncsBufferLength: 5,
    maxReEnactSteps: 60, // maximum number of steps to re-enact
    RTTEstimate: 2, // estimate the RTT as two steps (for updateRate=6, that's 200ms)
    extrapolate: 2, // player performs method "X" which means extrapolate to match server time. that 100 + (0..100)
    localObjBending: 0.1, // amount of bending towards position of sync object
    remoteObjBending: 0.6, // amount of bending towards position of sync object
    bendingIncrements: 10 // the bending should be applied increments (how many steps for entire bend)
};

var ExtrapolateStrategy = function (_SyncStrategy) {
    _inherits(ExtrapolateStrategy, _SyncStrategy);

    function ExtrapolateStrategy(clientEngine, inputOptions) {
        _classCallCheck(this, ExtrapolateStrategy);

        var options = Object.assign({}, defaults, inputOptions);

        var _this = _possibleConstructorReturn(this, (ExtrapolateStrategy.__proto__ || Object.getPrototypeOf(ExtrapolateStrategy)).call(this, clientEngine, options));

        _this.lastSync = null;
        _this.needFirstSync = true;
        _this.recentInputs = {};
        _this.gameEngine = _this.clientEngine.gameEngine;
        _this.gameEngine.on('client__postStep', _this.extrapolate.bind(_this));
        _this.gameEngine.on('client__syncReceived', _this.collectSync.bind(_this));
        _this.gameEngine.on('client__processInput', _this.clientInputSave.bind(_this));
        return _this;
    }

    // keep a buffer of inputs so that we can replay them on extrapolation


    _createClass(ExtrapolateStrategy, [{
        key: 'clientInputSave',
        value: function clientInputSave(inputData) {

            // if no inputs have been stored for this step, create an array
            if (!this.recentInputs[inputData.step]) {
                this.recentInputs[inputData.step] = [];
            }
            this.recentInputs[inputData.step].push(inputData);
        }

        // collect a sync and its events

    }, {
        key: 'collectSync',
        value: function collectSync(e) {

            // on first connect we need to wait for a full world update
            if (this.needFirstSync) {
                if (!e.fullUpdate) return;
            } else {

                // TODO: there is a problem below in the case where the client is 10 steps behind the server,
                // and the syncs that arrive are always in the future and never get processed.  To address this
                // we may need to store more than one sync.

                // ignore syncs which are older than the latest
                if (this.lastSync && this.lastSync.stepCount && this.lastSync.stepCount > e.stepCount) return;
            }

            // build new sync object
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
        }

        // add an object to our world

    }, {
        key: 'addNewObject',
        value: function addNewObject(objId, newObj, options) {

            var curObj = new newObj.constructor();
            curObj.syncTo(newObj);
            this.gameEngine.addObjectToWorld(curObj);
            console.log('adding new object ' + curObj);

            return curObj;
        }

        // clean up the input buffer

    }, {
        key: 'cleanRecentInputs',
        value: function cleanRecentInputs() {
            var firstReplayStep = this.gameEngine.world.stepCount - this.options.extrapolate;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.recentInputs)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var input = _step.value;

                    if (this.recentInputs[input].step < firstReplayStep) {
                        delete this.recentInputs[input];
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        // apply a new sync

    }, {
        key: 'applySync',
        value: function applySync() {
            var _this2 = this;

            this.gameEngine.trace.debug('extrapolate applying sync');

            //
            //    scan all the objects in the sync
            //
            // 1. if the object has a local shadow, adopt the server object,
            //    and destroy the shadow
            //
            // 2. if the object exists locally, sync to the server object,
            //    later we will re-enact the missing steps and then bend to
            //    the current position
            //
            // 3. if the object is new, just create it
            //
            this.needFirstSync = false;
            var world = this.gameEngine.world;
            var serverStep = this.lastSync.stepCount;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(this.lastSync.syncObjects)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var ids = _step2.value;


                    // TODO: we are currently taking only the first event out of
                    // the events that may have arrived for this object
                    var ev = this.lastSync.syncObjects[ids][0];
                    var curObj = world.objects[ev.objectInstance.id];

                    var localShadowObj = this.gameEngine.findLocalShadow(ev.objectInstance);
                    if (localShadowObj) {

                        // case 1: this object has a local shadow object on the client
                        this.gameEngine.trace.debug('object ' + ev.objectInstance.id + ' replacing local shadow ' + localShadowObj.id);

                        if (!world.objects.hasOwnProperty(ev.objectInstance.id)) {
                            var newObj = this.addNewObject(ev.objectInstance.id, ev.objectInstance, { visible: false });
                            newObj.saveState(localShadowObj);
                        }
                        this.gameEngine.removeObjectFromWorld(localShadowObj.id);
                    } else if (curObj) {

                        // case 2: this object already exists locally
                        this.gameEngine.trace.trace('object before syncTo: ' + curObj.toString());
                        curObj.saveState();
                        curObj.syncTo(ev.objectInstance);
                        this.gameEngine.trace.trace('object after syncTo: ' + curObj.toString() + ' synced to step[' + ev.stepCount + ']');
                    } else {

                        // case 3: object does not exist.  create it now
                        this.addNewObject(ev.objectInstance.id, ev.objectInstance);
                    }
                }

                //
                // reenact the steps that we want to extrapolate forwards
                //
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            this.cleanRecentInputs();
            this.gameEngine.trace.debug('extrapolate re-enacting steps from [' + serverStep + '] to [' + world.stepCount + ']');
            if (serverStep < world.stepCount - this.options.maxReEnactSteps) {
                serverStep = world.stepCount - this.options.maxReEnactSteps;
                this.gameEngine.trace.info('too many steps to re-enact.  Starting from [' + serverStep + '] to [' + world.stepCount + ']');
            }

            var clientStep = world.stepCount;
            for (world.stepCount = serverStep; world.stepCount < clientStep;) {
                if (this.recentInputs[world.stepCount]) {
                    this.recentInputs[world.stepCount].forEach(function (inputData) {

                        // only movement inputs are re-enacted
                        if (!inputData.inputOptions || !inputData.inputOptions.movement) return;

                        _this2.gameEngine.trace.trace('extrapolate re-enacting movement input[' + inputData.messageIndex + ']: ' + inputData.input);
                        _this2.gameEngine.processInput(inputData, _this2.clientEngine.playerId);
                    });
                }

                // run the game engine step in "reenact" mode
                this.gameEngine.step(true);
            }

            //
            // bend back to original state
            //
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(world.objects)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var objId = _step3.value;


                    // shadow objects are not bent
                    if (objId >= this.gameEngine.options.clientIDSpace) continue;

                    // TODO: using == instead of === because of string/number mismatch
                    //       These values should always be strings (which contain a number)
                    //       Reminder: the reason we use a string is that these
                    //       values are sometimes used as object keys
                    var obj = world.objects[objId];
                    var isLocal = obj.playerId == this.clientEngine.playerId; // eslint-disable-line eqeqeq
                    var bending = isLocal ? this.options.localObjBending : this.options.remoteObjBending;
                    obj.bendToCurrentState(bending, this.gameEngine.worldSettings, isLocal, this.options.bendingIncrements);
                    if (typeof obj.refreshRenderObject === 'function') obj.refreshRenderObject();
                    this.gameEngine.trace.trace('object[' + objId + '] ' + obj.bendingToString());
                }

                // trace object state after sync
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.keys(world.objects)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _objId = _step4.value;

                    this.gameEngine.trace.trace('object after extrapolate replay: ' + world.objects[_objId].toString());
                }

                // destroy objects
                // TODO: use world.forEachObject((id, ob) => {});
                // TODO: identical code is in InterpolateStrategy
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                var _loop = function _loop() {
                    var objId = _step5.value;

                    var objEvents = _this2.lastSync.syncObjects[objId];
                    if (!objEvents || objId >= _this2.gameEngine.options.clientIDSpace) return 'continue';

                    objEvents.forEach(function (e) {
                        if (e.eventName === 'objectDestroy') _this2.gameEngine.removeObjectFromWorld(objId);
                    });
                };

                for (var _iterator5 = Object.keys(world.objects)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _ret = _loop();

                    if (_ret === 'continue') continue;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }

        // Perform client-side extrapolation.

    }, {
        key: 'extrapolate',
        value: function extrapolate(stepDesc) {

            // apply incremental bending
            this.gameEngine.world.forEachObject(function (id, o) {
                if (typeof o.applyIncrementalBending === 'function') {
                    o.applyIncrementalBending(stepDesc);
                    o.refreshToPhysics();
                    // this.gameEngine.trace.trace(`object[${id}] after bending : ${o.toString()}`);
                }
            });

            // if there is a sync from the server, from the past or present, apply it now
            if (this.lastSync && this.lastSync.stepCount <= this.gameEngine.world.stepCount) {
                this.applySync();
                this.lastSync = null;
            }
        }
    }]);

    return ExtrapolateStrategy;
}(_SyncStrategy3.default);

exports.default = ExtrapolateStrategy;