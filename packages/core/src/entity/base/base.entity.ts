import { DeepPartial, ID } from '@ecomentor/common/lib/shared-types';
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PrimaryGeneratedId } from '../entity-id.decorator';

/**
 * @description
 * This is the base class from which all entities inherit. The type of
 * the `id` property is defined by the {@link EntityIdStrategy}.
 *
 * @docsCategory entities
 */
export abstract class EcomentorEntity {
    protected constructor(input?: DeepPartial<EcomentorEntity>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    @PrimaryGeneratedId()
    id: ID;

    @CreateDateColumn() createdAt: Date;

    @UpdateDateColumn() updatedAt: Date;
}
