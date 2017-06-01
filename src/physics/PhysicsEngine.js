'use strict';

// The base Physics Engine class defines the expected interface
// for all physics engines
class PhysicsEngine {

    init(options) {
        this.options = options;
        this.gameEngine = options.gameEngine;
    }

    /**
     * A single Physics step.
     *
     * @param {Number} dt - [optional], time passed since last step
     * @param {Function} objectFilter - [optional] a test function which filters which objects should move
     */
    step(objectFilter) {}

}

module.exports = PhysicsEngine;
