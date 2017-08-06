import Serializable from './../serialize/Serializable';
import TYPES from './../serialize/types';

/**
 * Defines a collection of NetworkEvents to be transmitted over the wire
 */
export default class NetworkedEventCollection extends Serializable {

    static get netScheme() {
        return {
            events: {
                type: TYPES.LIST,
                itemType: TYPES.CLASSINSTANCE
            },
        };
    }

    constructor(events) {
        super();
        this.events = events;
    }

}