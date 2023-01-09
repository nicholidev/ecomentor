import { getMetadataArgsStorage } from 'typeorm';

import { EcomentorConfig } from '../config/index';

export async function runEntityMetadataModifiers(config: EcomentorConfig) {
    if (config.entityOptions?.metadataModifiers?.length) {
        const metadataArgsStorage = getMetadataArgsStorage();
        for (const modifier of config.entityOptions.metadataModifiers) {
            await modifier(metadataArgsStorage);
        }
    }
}
