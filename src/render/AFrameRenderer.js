'use strict';
/* globals AFRAME */

const EventEmitter = require('eventemitter3');
const networkedPhysics = require('./aframe/system');


// TODO: this class should extend the base Renderer or explain why it doesn't


/**
 * The A-Frame Renderer
 */
class AFrameRenderer {

    /**
    * Constructor of the Renderer singleton.
    * @param {GameEngine} gameEngine - Reference to the GameEngine instance.
    * @param {ClientEngine} clientEngine - Reference to the ClientEngine instance.
    */
    constructor(gameEngine, clientEngine) {
        this.gameEngine = gameEngine;
        this.clientEngine = clientEngine;

        // mixin for EventEmitter
        Object.assign(this, EventEmitter.prototype);

        // set up the networkedPhysics as an A-Frame system
        networkedPhysics.setGlobals(gameEngine, this);
        AFRAME.registerSystem('networked-physics', networkedPhysics);
    }

    reportSlowFrameRate() {
        this.gameEngine.emit('client__slowFrameRate');
    }

// HACK: why doesn't AFRAME renderer extend the base Renderer?
    draw(t, dt) {
        let p = this.clientEngine.options.stepPeriod;



        // if (this.clientEngine.lastStepTime < t) {
        //     // HACK: remove next line
        //     this.clientEngine.gameEngine.trace.trace(`============RESETTING lastTime=${this.clientEngine.lastStepTime} period=${p}`);
        //
        //     this.clientEngine.lastStepTime = t;
        //     return;
        // }

// HACK: remove next line
this.clientEngine.gameEngine.trace.trace(`============RENDERER DRAWING t=${t} dt=${dt} lastTime=${this.clientEngine.lastStepTime} correction = ${this.clientEngine.correction} period=${p}`);

        // catch-up missed steps
        while (t > this.clientEngine.lastStepTime + p) {
// HACK: remove next line
this.clientEngine.gameEngine.trace.trace(`============RENDERER Extra call to client`);
            this.clientEngine.step(this.clientEngine.lastStepTime + p, p + this.clientEngine.correction);
            this.clientEngine.lastStepTime += p;
            this.clientEngine.correction = 0;
            // dt -= p;
        }

        // render-tuned step
        this.clientEngine.step(t, t - this.clientEngine.lastStepTime + this.clientEngine.correction);
        this.clientEngine.lastStepTime += p;
        this.clientEngine.correction = this.clientEngine.lastStepTime - t;
    }

    /**
     * Initialize the renderer.
     * @return {Promise} Resolves when renderer is ready.
    */
    init() {
        if ((typeof window === 'undefined') || !document) {
            console.log('renderer invoked on server side.');
        }

        let sceneElArray = document.getElementsByTagName('a-scene');
        if (sceneElArray.length !== 1) {
            throw new Error('A-Frame scene element not found');
        }
        this.scene = sceneElArray[0];

        this.gameEngine.on('objectRemoved', (o) => {
            o.renderObj.remove();
        });

        return Promise.resolve(); // eslint-disable-line new-cap
    }

}

module.exports = AFrameRenderer;
