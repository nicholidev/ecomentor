import { RequestContext } from '../api';

import { EcomentorEvent } from './ecomentor-event';

/**
 * @description
 * The base class for all entity events used by the EventBus system.
 * * For event type `'updated'` the entity is the one before applying the patch (if not documented otherwise).
 * * For event type `'deleted'` the input will most likely be an `id: ID`
 *
 * @docsCategory events
 * */
export abstract class EcomentorEntityEvent<Entity, Input = any> extends EcomentorEvent {
    public readonly entity: Entity;
    public readonly type: 'created' | 'updated' | 'deleted';
    public readonly ctx: RequestContext;
    public readonly input?: Input;

    protected constructor(
        entity: Entity,
        type: 'created' | 'updated' | 'deleted',
        ctx: RequestContext,
        input?: Input,
    ) {
        super();
        this.entity = entity;
        this.type = type;
        this.ctx = ctx;
        this.input = input;
    }
}
