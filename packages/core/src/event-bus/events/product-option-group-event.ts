import {
    CreateProductOptionGroupInput,
    UpdateProductOptionGroupInput,
} from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { ProductOptionGroup } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type ProductOptionGroupInputTypes = CreateProductOptionGroupInput | UpdateProductOptionGroupInput | ID;

/**
 * @description
 * This event is fired whenever a {@link ProductOptionGroup} is added or updated.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
export class ProductOptionGroupEvent extends EcomentorEntityEvent<
    ProductOptionGroup,
    ProductOptionGroupInputTypes
> {
    constructor(
        ctx: RequestContext,
        entity: ProductOptionGroup,
        type: 'created' | 'updated' | 'deleted',
        input?: ProductOptionGroupInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
