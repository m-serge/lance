"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
var GameWorld = function () {

    /**
     * Constructor of the World instance
     */
    function GameWorld() {
        _classCallCheck(this, GameWorld);

        this.stepCount = 0;
        this.objects = {};
        this.playerCount = 0;
        this.idCount = 0;
    }

    /**
     * World object iterator.
     * Invoke callback(objId, obj) for each object
     *
     * @param {function} callback function receives id and object
     */


    _createClass(GameWorld, [{
        key: "forEachObject",
        value: function forEachObject(callback) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.objects)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var id = _step.value;

                    callback(id, this.objects[id]);
                } // TODO: the key should be Number(id)
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         * Return the primary game object for a specific player
         *
         * @param {Number} playerId the player ID
         * @return {Object} game object for this player
         */

    }, {
        key: "getPlayerObject",
        value: function getPlayerObject(playerId) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(this.objects)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var objId = _step2.value;

                    var o = this.objects[objId];
                    if (o.playerId === playerId) return o;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        /**
         * Return an array of all the game objects owned by a specific player
         *
         * @param {Number} playerId the player ID
         * @return {Array} game objects owned by this player
         */

    }, {
        key: "getOwnedObject",
        value: function getOwnedObject(playerId) {
            var owned = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(this.objects)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var objId = _step3.value;

                    var o = this.objects[objId];
                    if (o.ownerId === playerId) owned.push(o);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return owned;
        }
    }]);

    return GameWorld;
}();

exports.default = GameWorld;