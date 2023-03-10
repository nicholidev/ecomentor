import { CreatePromotionInput, UpdatePromotionInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { Promotion } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type PromotionInputTypes = CreatePromotionInput | UpdatePromotionInput | ID;

/**
 * @description
 * This event is fired whenever a {@link Promotion} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class PromotionEvent extends EcomentorEntityEvent<Promotion, PromotionInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Promotion,
        type: 'created' | 'updated' | 'deleted',
        input?: PromotionInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
