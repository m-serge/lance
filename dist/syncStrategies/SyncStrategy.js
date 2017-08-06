"use strict";

// TODO: make this class non-trivial, or remove it

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SyncStrategy = function SyncStrategy(clientEngine, inputOptions) {
    _classCallCheck(this, SyncStrategy);

    this.clientEngine = clientEngine;
    this.gameEngine = clientEngine.gameEngine;
    this.options = Object.assign({}, inputOptions);
};

module.exports = SyncStrategy;