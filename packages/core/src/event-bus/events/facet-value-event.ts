import {
    CreateFacetValueInput,
    CreateFacetValueWithFacetInput,
    UpdateFacetValueInput,
} from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api';
import { FacetValue } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type FacetValueInputTypes =
    | CreateFacetValueInput
    | CreateFacetValueWithFacetInput
    | UpdateFacetValueInput
    | ID;

/**
 * @description
 * This event is fired whenever a {@link FacetValue} is added, updated or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
export class FacetValueEvent extends EcomentorEntityEvent<FacetValue, FacetValueInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: FacetValue,
        type: 'created' | 'updated' | 'deleted',
        input?: FacetValueInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
