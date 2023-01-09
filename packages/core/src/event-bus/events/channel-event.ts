import { CreateChannelInput, UpdateChannelInput } from '@ecomentor/common/lib/generated-types';
import { ID } from '@ecomentor/common/lib/shared-types';

import { RequestContext } from '../../api';
import { Channel } from '../../entity';
import { EcomentorEntityEvent } from '../ecomentor-entity-event';

type ChannelInputTypes = CreateChannelInput | UpdateChannelInput | ID;

/**
 * @description
 * This event is fired whenever a {@link Channel} is added, updated or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
export class ChannelEvent extends EcomentorEntityEvent<Channel, ChannelInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: Channel,
        type: 'created' | 'updated' | 'deleted',
        input?: ChannelInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
