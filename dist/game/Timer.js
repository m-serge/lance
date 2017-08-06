'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
class Timer {

    constructor() {
        this.currentTime = 0;
        this.isActive = false;
        this.idCounter = 0;

        this.events = {};
    }

    play() {
        this.isActive = true;
    }

    tick() {
        let event;
        let eventId;

        if (this.isActive) {
            this.currentTime++;

            for (eventId in this.events) {
                event = this.events[eventId];
                if (event) {

                    if (event.type == 'repeat') {
                        if ((this.currentTime - event.startOffset) % event.time == 0) {
                            event.callback.apply(event.thisContext, event.args);
                        }
                    }
                    if (event.type == 'single') {
                        if ((this.currentTime - event.startOffset) % event.time == 0) {
                            event.callback.apply(event.thisContext, event.args);
                            event.destroy();
                        }
                    }
                }
            }
        }
    }

    destroyEvent(eventId) {
        delete this.events[eventId];
    }

    loop(time, callback) {
        let timerEvent = new TimerEvent(this, TimerEvent.TYPES.repeat, time, callback);

        this.events[timerEvent.id] = timerEvent;

        return timerEvent;
    }

    add(time, callback, thisContext, args) {
        let timerEvent = new TimerEvent(this, TimerEvent.TYPES.single, time, callback, thisContext, args);

        this.events[timerEvent.id] = timerEvent;
        return timerEvent;
    }

    // todo implement timer delete all events

    destroy(id) {
        delete this.events[id];
    }
}

exports.default = Timer; // timer event

class TimerEvent {
    constructor(timer, type, time, callback, thisContext, args) {
        this.id = ++timer.idCounter;
        this.timer = timer;
        this.type = type;
        this.time = time;
        this.callback = callback;
        this.startOffset = timer.currentTime;
        this.thisContext = thisContext;
        this.args = args;

        this.destroy = function () {
            this.timer.destroy(this.id);
        };
    }
}

TimerEvent.TYPES = {
    repeat: 'repeat',
    single: 'single'
};