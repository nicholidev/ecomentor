import { CreatePaymentMethodInput, UpdatePaymentMethodInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { PaymentMethod } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type PaymentMethodInputTypes = CreatePaymentMethodInput | UpdatePaymentMethodInput | ID;

/**
 * @description
 * This event is fired whenever a {@link PaymentMethod} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class PaymentMethodEvent extends EcomentorEntityEvent<PaymentMethod, PaymentMethodInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: PaymentMethod,
        type: 'created' | 'updated' | 'deleted',
        input?: PaymentMethodInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
