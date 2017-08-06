'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//todo add all keyboard keys

// keyboard handling
var keyCodeTable = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    87: 'w',
    68: 'd',
    83: 's'
};

/**
 * This class allows easy usage of device keyboard controls
 */

var KeyboardControls = function () {
    function KeyboardControls(clientEngine) {
        var _this = this;

        _classCallCheck(this, KeyboardControls);

        Object.assign(this, _eventemitter2.default.prototype);
        this.clientEngine = clientEngine;
        this.gameEngine = clientEngine.gameEngine;

        this.setupListeners();

        // keep a reference for key press state
        this.keyState = {};

        // a list of bound keys and their corresponding actions
        this.boundKeys = {};

        this.gameEngine.on('client__preStep', function () {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(_this.boundKeys)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var keyName = _step.value;

                    if (_this.keyState[keyName] && _this.keyState[keyName].isDown) {

                        //handle repeat press
                        if (_this.boundKeys[keyName].options.repeat || _this.keyState[keyName].count == 0) {
                            //todo movement is probably redundant
                            _this.clientEngine.sendInput(_this.boundKeys[keyName].actionName, { movement: true });
                            _this.keyState[keyName].count++;
                        }
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
        });
    }

    _createClass(KeyboardControls, [{
        key: 'setupListeners',
        value: function setupListeners() {
            var _this2 = this;

            document.addEventListener('keydown', function (e) {
                _this2.onKeyChange(e, true);
            });
            document.addEventListener('keyup', function (e) {
                _this2.onKeyChange(e, false);
            });
        }
    }, {
        key: 'bindKey',
        value: function bindKey(keys, actionName, options) {
            var _this3 = this;

            if (!Array.isArray(keys)) keys = [keys];

            var keyOptions = Object.assign({
                repeat: false
            }, options);

            keys.forEach(function (keyName) {
                _this3.boundKeys[keyName] = { actionName: actionName, options: keyOptions };
            });
        }

        //todo implement unbindKey

    }, {
        key: 'onKeyChange',
        value: function onKeyChange(e, isDown) {
            e = e || window.event;

            var keyName = keyCodeTable[e.keyCode];
            if (keyName) {
                if (this.keyState[keyName] == null) {
                    this.keyState[keyName] = {
                        count: 0
                    };
                }
                this.keyState[keyName].isDown = isDown;

                //key up, reset press count
                if (!isDown) this.keyState[keyName].count = 0;

                // keep reference to the last key pressed to avoid duplicates
                this.lastKeyPressed = isDown ? e.keyCode : null;
                // this.renderer.onKeyChange({ keyName, isDown });
                e.preventDefault();
            }
        }
    }]);

    return KeyboardControls;
}();

exports.default = KeyboardControls;