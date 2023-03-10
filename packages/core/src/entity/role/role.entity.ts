import { Permission } from '@ecomentor/common/lib/generated-types';
import { DeepPartial } from '@ecomentor/common/lib/shared-types';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { ChannelAware } from '../../common/types/common-types';
import { VendureEntity } from '../base/base.entity';
import { Channel } from '../channel/channel.entity';

/**
 * @description
 * A Role represents a collection of permissions which determine the authorization
 * level of a {@link User}.
 *
 * @docsCategory entities
 */
@Entity()
export class Role extends VendureEntity implements ChannelAware {
    constructor(input?: DeepPartial<Role>) {
        super(input);
    }

    @Column() code: string;

    @Column() description: string;

    @Column('simple-array') permissions: Permission[];

    @ManyToMany(type => Channel)
    @JoinTable()
    channels: Channel[];
}
