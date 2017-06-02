'use strict';
/* globals AFRAME */

const EventEmitter = require('eventemitter3');
const networkedPhysics = require('./aframe/system');
const TIME_RESET_THRESHOLD = 100;

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

        this.gameEngine.on('client__stepReset', () => { this.doReset = true; });

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
        if (this.doReset || t > this.clientEngine.lastStepTime + TIME_RESET_THRESHOLD) {
             this.doReset = false;
             this.clientEngine.lastStepTime = t - p/2;
             this.clientEngine.correction = p/2;
             this.clientEngine.gameEngine.trace.trace(`============RESETTING lastTime=${this.clientEngine.lastStepTime} period=${p}`);
        }


        // catch-up missed steps
        while (t > this.clientEngine.lastStepTime + p) {
// HACK: remove next line
this.clientEngine.gameEngine.trace.trace(`============RENDERER DRAWING EXTRA t=${t} LST=${this.clientEngine.lastStepTime} correction = ${this.clientEngine.correction} period=${p}`);
            this.clientEngine.step(this.clientEngine.lastStepTime + p, p + this.clientEngine.correction);
            this.clientEngine.lastStepTime += p;
            this.clientEngine.correction = 0;
        }

        // not ready for a real step yet
        // might happen after catch up above
        if (t < this.clientEngine.lastStepTime) {
            this.clientEngine.gameEngine.trace.trace(`============RENDERER DRAWING NOSTEP t=${t} dt=${t - this.clientEngine.lastStepTime} correction = ${this.clientEngine.correction} period=${p}`);

            dt = t - this.clientEngine.lastStepTime + this.clientEngine.correction;
            if (dt<0) dt = 0;
            this.clientEngine.correction = this.clientEngine.lastStepTime - t;
            this.clientEngine.step(t, dt, true); 
            return;
        }

        // render-controlled step

// HACK: remove next line
this.clientEngine.gameEngine.trace.trace(`============RENDERER DRAWING t=${t} LST=${this.clientEngine.lastStepTime} correction = ${this.clientEngine.correction} period=${p}`);

        dt =  t - this.clientEngine.lastStepTime + this.clientEngine.correction;
        this.clientEngine.lastStepTime += p;
        this.clientEngine.correction = this.clientEngine.lastStepTime - t;
        this.clientEngine.step(t, dt);
this.clientEngine.gameEngine.trace.trace(`============RENDERER DONE t=${t} LST=${this.clientEngine.lastStepTime} correction = ${this.clientEngine.correction} period=${p}`);
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
