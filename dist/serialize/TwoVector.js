'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Serializable = require('./Serializable');

var _Serializable2 = _interopRequireDefault(_Serializable);

var _Serializer = require('./Serializer');

var _Serializer2 = _interopRequireDefault(_Serializer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A TwoVector is a geometric object which is completely described
 * by two values.
 */
class TwoVector extends _Serializable2.default {

    static get netScheme() {
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
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;

        return this;
    }

    /**
     * Formatted textual description of the TwoVector.
     * @return {String} description
     */
    toString() {
        function round3(x) {
            return Math.round(x * 1000) / 1000;
        }
        return `(${round3(this.x)}, ${round3(this.y)})`;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    multiply(other) {
        this.x *= other.x;
        this.y *= other.y;

        return this;
    }

    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;

        return this;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;

        return this;
    }

    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;

        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        this.multiplyScalar(1 / this.length());
        return this;
    }

    copy(sourceObj) {
        this.x = sourceObj.x;
        this.y = sourceObj.y;

        return this;
    }

    clone() {
        return new TwoVector(this.x, this.y);
    }

    lerp(target, p) {
        this.x += (target.x - this.x) * p;
        this.y += (target.y - this.y) * p;
    }
}
exports.default = TwoVector;