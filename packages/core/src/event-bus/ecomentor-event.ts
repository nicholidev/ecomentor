/**
 * @description
 * The base class for all events used by the EventBus system.
 *
 * @docsCategory events
 * */
export abstract class EcomentorEvent {
    public readonly createdAt: Date;
    protected constructor() {
        this.createdAt = new Date();
    }
}
