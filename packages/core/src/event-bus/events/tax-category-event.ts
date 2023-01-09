import { CreateTaxCategoryInput, UpdateTaxCategoryInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { TaxCategory } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type TaxCategoryInputTypes = CreateTaxCategoryInput | UpdateTaxCategoryInput | ID;

/**
 * @description
 * This event is fired whenever a {@link TaxCategory} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class TaxCategoryEvent extends EcomentorEntityEvent<TaxCategory, TaxCategoryInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: TaxCategory,
        type: 'created' | 'updated' | 'deleted',
        input?: TaxCategoryInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
