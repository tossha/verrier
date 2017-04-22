class EventHandler
{
    constructor(domElement) {
        this.domElement = domElement;
        this.listeners = {};
        this.handlers = {};
    }

    addListener(eventName, listener, priority) {
        if (!this.handlers[eventName]) {
            this.listeners[eventName] = [];
            this.handlers[eventName] = (e) => {
                this.handleEvent(eventName, e)
            };
            this.domElement.addEventListener(eventName, this.handlers[eventName]);
        }

        this.listeners[eventName].push({
            handler: listener,
            priority: priority
        });
    }

    removeListener(eventName, listener) {
        const list = this.listeners[eventName];
        for (let idx = 0; idx < list.length; idx++) {
            if (list[idx].handler === listener) {
                list[idx] = list[list.length - 1];
                list.pop();
            }
        }
    }

    handleEvent(eventName, eventObject) {
        const list = this.listeners[eventName];

        if (list.length === 0) {
            return;
        }

        const highestPriority = list.reduce((val, a) => Math.max(val, a.priority), list[0].priority);

        for (let listener of list) {
            if (listener.priority === highestPriority) {
                listener.handler(eventObject);
            }
        }
    }
}
