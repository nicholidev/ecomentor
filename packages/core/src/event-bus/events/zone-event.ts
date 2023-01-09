import { CreateZoneInput, UpdateZoneInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api/common/request-context';
import { Zone } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type ZoneInputTypes = CreateZoneInput | UpdateZoneInput | ID;

/**
 * @description
 * This event is fired whenever a {@link Zone} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class ZoneEvent extends EcomentorEntityEvent<Zone, ZoneInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Zone,
        type: 'created' | 'updated' | 'deleted',
        input?: ZoneInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
