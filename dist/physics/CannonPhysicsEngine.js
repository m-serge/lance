'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _PhysicsEngine = require('./PhysicsEngine');

var _PhysicsEngine2 = _interopRequireDefault(_PhysicsEngine);

var _cannon = require('cannon');

var _cannon2 = _interopRequireDefault(_cannon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CannonPhysicsEngine is a three-dimensional lightweight physics engine
 */
class CannonPhysicsEngine extends _PhysicsEngine2.default {

    constructor(options) {
        super(options);

        this.options.dt = this.options.dt || 1 / 60;
        let world = this.world = new _cannon2.default.World();
        world.quatNormalizeSkip = 0;
        world.quatNormalizeFast = false;
        world.gravity.set(0, -10, 0);
        world.broadphase = new _cannon2.default.NaiveBroadphase();
        this.CANNON = _cannon2.default;
    }

    // entry point for a single step of the Simple Physics
    step(dt, objectFilter) {
        this.world.step(dt || this.options.dt);
    }

    addSphere(radius, mass) {
        let shape = new _cannon2.default.Sphere(radius);
        let body = new _cannon2.default.Body({ mass, shape });
        body.position.set(0, 0, 0);
        this.world.addBody(body);
        return body;
    }

    addBox(x, y, z, mass, friction) {
        let shape = new _cannon2.default.Box(new _cannon2.default.Vec3(x, y, z));
        let options = { mass, shape };
        if (friction !== undefined) options.material = new _cannon2.default.Material({ friction });

        let body = new _cannon2.default.Body(options);
        body.position.set(0, 0, 0);
        this.world.addBody(body);
        return body;
    }

    addCylinder(radiusTop, radiusBottom, height, numSegments, mass) {
        let shape = new _cannon2.default.Cylinder(radiusTop, radiusBottom, height, numSegments);
        let body = new _cannon2.default.Body({ mass, shape });
        this.world.addBody(body);
        return body;
    }

    removeObject(obj) {
        this.world.removeBody(obj);
    }
}
exports.default = CannonPhysicsEngine;