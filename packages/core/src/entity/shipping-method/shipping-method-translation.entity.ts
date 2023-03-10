import { LanguageCode } from '@ecomentor/common/lib/generated-types';
import { DeepPartial } from '@ecomentor/common/lib/shared-types';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Translation } from '../../common/types/locale-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { VendureEntity } from '../base/base.entity';
import { CustomShippingMethodFieldsTranslation } from '../custom-entity-fields';
import { Product } from '../product/product.entity';

import { ShippingMethod } from './shipping-method.entity';

@Entity()
export class ShippingMethodTranslation
    extends VendureEntity
    implements Translation<ShippingMethod>, HasCustomFields {
    constructor(input?: DeepPartial<Translation<Product>>) {
        super(input);
    }

    @Column('varchar') languageCode: LanguageCode;

    @Column({ default: '' }) name: string;

    @Column({ default: '' }) description: string;

    @ManyToOne(type => ShippingMethod, base => base.translations)
    base: ShippingMethod;

    @Column(type => CustomShippingMethodFieldsTranslation)
    customFields: CustomShippingMethodFieldsTranslation;
}
