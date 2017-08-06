'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Renderer = require('./Renderer');

var _Renderer2 = _interopRequireDefault(_Renderer);

var _system = require('./aframe/system');

var _system2 = _interopRequireDefault(_system);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The A-Frame Renderer
 */
/* globals AFRAME */

class AFrameRenderer extends _Renderer2.default {

    /**
    * Constructor of the Renderer singleton.
    * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
    * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
    */
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);

        // set up the networkedPhysics as an A-Frame system
        _system2.default.setGlobals(gameEngine, this);
        AFRAME.registerSystem('networked-physics', _system2.default);
    }

    reportSlowFrameRate() {
        this.gameEngine.emit('client__slowFrameRate');
    }

    /**
     * Initialize the renderer.
     * @return {Promise} Resolves when renderer is ready.
    */
    init() {

        let p = super.init();

        let sceneElArray = document.getElementsByTagName('a-scene');
        if (sceneElArray.length !== 1) {
            throw new Error('A-Frame scene element not found');
        }
        this.scene = sceneElArray[0];

        this.gameEngine.on('objectRemoved', o => {
            o.renderObj.remove();
        });

        return p; // eslint-disable-line new-cap
    }

    /**
     * In AFrame, we set the draw method (which is called at requestAnimationFrame)
     * to a NO-OP. See tick() instead
     */
    draw() {}

    tick(t, dt) {
        super.draw(t, dt);
    }

}
exports.default = AFrameRenderer;