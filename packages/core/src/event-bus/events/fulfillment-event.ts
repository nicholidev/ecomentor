import { ConfigurableOperationInput } from '@ecomentor/common/lib/generated-types';

import { RequestContext } from '../../api';
import { Order, OrderItem } from '../../entity';
import { Fulfillment } from '../../entity/fulfillment/fulfillment.entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

/**
 * @description
 * The inputs used to create a new fulfillment
 * @since 1.4
 */
type CreateFulfillmentInput = {
    orders: Order[];
    items: OrderItem[];
    handler: ConfigurableOperationInput;
};

/**
 * @description
 * This event is fired whenever a {@link Fulfillment} is added. The type is always `created`.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
export class FulfillmentEvent extends EcomentorEntityEvent<Fulfillment, CreateFulfillmentInput> {
    constructor(ctx: RequestContext, entity: Fulfillment, input?: CreateFulfillmentInput) {
        super(entity, 'created', ctx, input);
    }
}
