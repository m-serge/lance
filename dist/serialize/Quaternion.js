'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Serializable = require('./Serializable');

var _Serializable2 = _interopRequireDefault(_Serializable);

var _ThreeVector = require('./ThreeVector');

var _ThreeVector2 = _interopRequireDefault(_ThreeVector);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Quaternion is a geometric object which can be used to
 * represent a three-dimensional rotation.
 */
class Quaternion extends _Serializable2.default {

    static get netScheme() {
        return {
            w: { type: _types2.default.FLOAT32 },
            x: { type: _types2.default.FLOAT32 },
            y: { type: _types2.default.FLOAT32 },
            z: { type: _types2.default.FLOAT32 }
        };
    }

    /**
    * Creates an instance of a Quaternion.
    * @param {Number} w - first value
    * @param {Number} x - second value
    * @param {Number} y - third value
    * @param {Number} z - fourth value
    * @return {Quaternion} v - the new Quaternion
    */
    constructor(w, x, y, z) {
        super();
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    /**
     * Formatted textual description of the Quaternion.
     * @return {String} description
     */
    toString() {
        function round3(x) {
            return Math.round(x * 1000) / 1000;
        }
        return `quaternion(${round3(this.w)}, ${round3(this.x)}, ${round3(this.y)}, ${round3(this.z)})`;
    }

    /**
     * copy values from another quaternion into this quaternion
     *
     * @param {Quaternion} sourceObj the quaternion to copy from
     * @return {Quaternion} returns self
     */
    copy(sourceObj) {
        this.set(sourceObj.w, sourceObj.x, sourceObj.y, sourceObj.z);
        return this;
    }

    /**
     * set quaternion values
     *
     * @param {Number} w w-value
     * @param {Number} x x-value
     * @param {Number} y y-value
     * @param {Number} z z-value
     * @return {Quaternion} returns self
     */
    set(w, x, y, z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    /**
     * return an axis-angle representation of this quaternion
     *
     * @return {Object} contains two attributes: axis (ThreeVector) and angle.
     */
    toAxisAngle() {

        // assuming quaternion normalised then w is less than 1, so term always positive.
        let axis = new _ThreeVector2.default(1, 0, 0);
        let angle = 2 * Math.acos(this.w);
        let s = Math.sqrt(1 - this.w * this.w);
        if (s > 0.001) {
            let divS = 1 / s;
            axis.x = this.x * divS;
            axis.y = this.y * divS;
            axis.z = this.z * divS;
        }
        return { axis, angle };
    }

    /**
     * set the values of this quaternion from an axis/angle representation
     *
     * @param {ThreeVector} axis The axis
     * @param {Number} angle angle in radians
     * @return {Quaternion} returns self
     */
    setFromAxisAngle(axis, angle) {

        let halfAngle = angle * 0.5;
        let s = Math.sin(halfAngle);
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);

        return this;
    }

    /**
     * conjugate the quaternion, in-place
     *
     * @return {Quaternion} returns self
     */
    conjugate() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
    }

    /* eslint-disable */
    /**
     * multiply this quaternion by another, in-place
     *
     * @param {Quaternion} other The other quaternion
     * @return {Quaternion} returns self
     */
    multiply(other) {
        let aw = this.w,
            ax = this.x,
            ay = this.y,
            az = this.z;
        let bw = other.w,
            bx = other.x,
            by = other.y,
            bz = other.z;

        this.x = ax * bw + aw * bx + ay * bz - az * by;
        this.y = ay * bw + aw * by + az * bx - ax * bz;
        this.z = az * bw + aw * bz + ax * by - ay * bx;
        this.w = aw * bw - ax * bx - ay * by - az * bz;

        return this;
    }
    /* eslint-enable */

    /* eslint-disable */
    /**
     * Apply in-place slerp (spherical linear interpolation) to this quaternion,
     * towards another quaternion.
     *
     * @param {Quaternion} target The target quaternion
     * @param {Number} bending The percentage to interpolate
     * @return {Quaternion} returns self
     */
    slerp(target, bending) {
        let aw = this.w,
            ax = this.x,
            ay = this.y,
            az = this.z;
        let bw = target.w,
            bx = target.x,
            by = target.y,
            bz = target.z;

        let cosHalfTheta = aw * bw + ax * bx + ay * by + az * bz;
        if (cosHalfTheta < 0) {
            this.set(-bw, -bx, -by, -bz);
            cosHalfTheta = -cosHalfTheta;
        } else {
            this.copy(target);
        }

        if (cosHalfTheta >= 1.0) {
            this.set(aw, ax, ay, az);
            return this;
        }

        let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            this.set(0.5 * (aw + this.w), 0.5 * (ax + this.x), 0.5 * (ay + this.y), 0.5 * (az + this.z));
            return this;
        }

        let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        let ratioA = Math.sin((1 - bending) * halfTheta) / sinHalfTheta;
        let ratioB = Math.sin(bending * halfTheta) / sinHalfTheta;
        this.set(aw * ratioA + this.w * ratioB, ax * ratioA + this.x * ratioB, ay * ratioA + this.y * ratioB, az * ratioA + this.z * ratioB);
        return this;
    }
    /* eslint-enable */
}
exports.default = Quaternion;