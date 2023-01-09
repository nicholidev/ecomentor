import { CreateProductInput, UpdateProductInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { Product } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type ProductInputTypes = CreateProductInput | UpdateProductInput | ID;

/**
 * @description
 * This event is fired whenever a {@link Product} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class ProductEvent extends EcomentorEntityEvent<Product, ProductInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Product,
        type: 'created' | 'updated' | 'deleted',
        input?: ProductInputTypes,
    ) {
        super(entity, type, ctx, input);
    }

    /**
     * Return an product field to become compatible with the
     * deprecated old version of ProductEvent
     * @deprecated Use `entity` instead
     * @since 1.4
     */
    get product(): Product {
        return this.entity;
    }
}
