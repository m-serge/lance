'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Serializable2 = require('./Serializable');

var _Serializable3 = _interopRequireDefault(_Serializable2);

var _Serializer = require('./Serializer');

var _Serializer2 = _interopRequireDefault(_Serializer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A TwoVector is a geometric object which is completely described
 * by two values.
 */
var TwoVector = function (_Serializable) {
    _inherits(TwoVector, _Serializable);

    _createClass(TwoVector, null, [{
        key: 'netScheme',
        get: function get() {
            return {
                x: { type: _Serializer2.default.TYPES.FLOAT32 },
                y: { type: _Serializer2.default.TYPES.FLOAT32 }
            };
        }

        /**
        * Creates an instance of a TwoVector.
        * @param {Number} x - first value
        * @param {Number} y - second value
        * @return {TwoVector} v - the new TwoVector
        */

    }]);

    function TwoVector(x, y) {
        var _ret;

        _classCallCheck(this, TwoVector);

        var _this = _possibleConstructorReturn(this, (TwoVector.__proto__ || Object.getPrototypeOf(TwoVector)).call(this));

        _this.x = x;
        _this.y = y;

        return _ret = _this, _possibleConstructorReturn(_this, _ret);
    }

    /**
     * Formatted textual description of the TwoVector.
     * @return {String} description
     */


    _createClass(TwoVector, [{
        key: 'toString',
        value: function toString() {
            function round3(x) {
                return Math.round(x * 1000) / 1000;
            }
            return '(' + round3(this.x) + ', ' + round3(this.y) + ')';
        }
    }, {
        key: 'set',
        value: function set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
    }, {
        key: 'multiply',
        value: function multiply(other) {
            this.x *= other.x;
            this.y *= other.y;

            return this;
        }
    }, {
        key: 'multiplyScalar',
        value: function multiplyScalar(s) {
            this.x *= s;
            this.y *= s;

            return this;
        }
    }, {
        key: 'add',
        value: function add(other) {
            this.x += other.x;
            this.y += other.y;

            return this;
        }
    }, {
        key: 'subtract',
        value: function subtract(other) {
            this.x -= other.x;
            this.y -= other.y;

            return this;
        }
    }, {
        key: 'length',
        value: function length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
    }, {
        key: 'normalize',
        value: function normalize() {
            this.multiplyScalar(1 / this.length());
            return this;
        }
    }, {
        key: 'copy',
        value: function copy(sourceObj) {
            this.x = sourceObj.x;
            this.y = sourceObj.y;

            return this;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new TwoVector(this.x, this.y);
        }
    }, {
        key: 'lerp',
        value: function lerp(target, p) {
            this.x += (target.x - this.x) * p;
            this.y += (target.y - this.y) * p;
        }
    }]);

    return TwoVector;
}(_Serializable3.default);

exports.default = TwoVector;