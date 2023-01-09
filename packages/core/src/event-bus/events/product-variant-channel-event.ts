import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { ProductVariant } from '../../entity';
import { VendureEvent } from '../ecomentor-event';

/**
 * @description
 * This event is fired whenever a {@link ProductVariant} is assigned or removed from a {@link Channel}.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class ProductVariantChannelEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        public productVariant: ProductVariant,
        public channelId: ID,
        public type: 'assigned' | 'removed',
    ) {
        super();
    }
}
