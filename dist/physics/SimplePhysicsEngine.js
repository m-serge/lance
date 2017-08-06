'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _PhysicsEngine = require('./PhysicsEngine');

var _PhysicsEngine2 = _interopRequireDefault(_PhysicsEngine);

var _TwoVector = require('../serialize/TwoVector');

var _TwoVector2 = _interopRequireDefault(_TwoVector);

var _HSHGCollisionDetection = require('./SimplePhysics/HSHGCollisionDetection');

var _HSHGCollisionDetection2 = _interopRequireDefault(_HSHGCollisionDetection);

var _BruteCollisionDetection = require('./SimplePhysics/BruteCollisionDetection');

var _BruteCollisionDetection2 = _interopRequireDefault(_BruteCollisionDetection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let dv = new _TwoVector2.default();
/**
 * SimplePhysicsEngine is a pseudo-physics engine which works with
 * objects of class DynamicObject.
 */
class SimplePhysicsEngine extends _PhysicsEngine2.default {

    constructor(initOptions) {
        super(initOptions);

        // todo does this mean both modules always get loaded?
        if (initOptions.collisions.type == 'HSHG') {
            this.collisionDetection = new _HSHGCollisionDetection2.default();
        } else {
            this.collisionDetection = new _BruteCollisionDetection2.default();
        }

        /**
         * The actor's name.
         * @member {TwoVector} constant gravity affecting all objects
         */
        this.gravity = new _TwoVector2.default(0, 0);

        if (initOptions.gravity) this.gravity.copy(initOptions.gravity);

        let collisionOptions = Object.assign({ gameEngine: this.gameEngine }, initOptions.collisionOptions);
        this.collisionDetection.init(collisionOptions);
    }

    // a single object advances, based on:
    // isRotatingRight, isRotatingLeft, isAccelerating, current velocity
    // wrap-around the world if necessary
    objectStep(o) {
        let worldSettings = this.gameEngine.worldSettings;

        if (o.isRotatingRight) {
            o.angle += o.rotationSpeed;
        }
        if (o.isRotatingLeft) {
            o.angle -= o.rotationSpeed;
        }

        if (o.angle >= 360) {
            o.angle -= 360;
        }
        if (o.angle < 0) {
            o.angle += 360;
        }

        if (o.isAccelerating) {
            let rad = o.angle * (Math.PI / 180);
            dv.set(Math.cos(rad), Math.sin(rad)).multiplyScalar(o.acceleration);
            o.velocity.add(dv);
        }

        // apply gravity
        if (o.affectedByGravity) o.velocity.add(this.gravity);

        let velMagnitude = o.velocity.length();
        if (o.maxSpeed !== null && velMagnitude > o.maxSpeed) {
            o.velocity.multiplyScalar(o.maxSpeed / velMagnitude);
        }

        o.isAccelerating = false;
        o.isRotatingLeft = false;
        o.isRotatingRight = false;

        o.position.add(o.velocity);

        o.velocity.multiply(o.friction);

        // wrap around the world edges
        if (worldSettings.worldWrap) {
            if (o.position.x >= worldSettings.width) {
                o.position.x -= worldSettings.width;
            }
            if (o.position.y >= worldSettings.height) {
                o.position.y -= worldSettings.height;
            }
            if (o.position.x < 0) {
                o.position.x += worldSettings.width;
            }
            if (o.position.y < 0) {
                o.position.y += worldSettings.height;
            }
        }
    }

    // entry point for a single step of the Simple Physics
    step(dt, objectFilter) {

        // specifying a specific dt is not allowed in this physics engine
        if (dt) throw new Error('Simple Physics Engine does not support variable step times');

        // each object should advance
        let objects = this.gameEngine.world.objects;
        for (let objId of Object.keys(objects)) {

            // shadow objects are not re-enacted
            let ob = objects[objId];
            if (!objectFilter(ob)) continue;

            // run the object step
            this.objectStep(ob);
        }

        // emit event on collision
        this.collisionDetection.detect(this.gameEngine);
    }
}
exports.default = SimplePhysicsEngine;