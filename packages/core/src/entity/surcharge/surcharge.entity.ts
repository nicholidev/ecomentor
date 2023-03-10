import { TaxLine } from '@ecomentor/common/lib/generated-types';
import { DeepPartial } from '@ecomentor/common/lib/shared-types';
import { summate } from '@ecomentor/common/lib/shared-utils';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Calculated } from '../../common/calculated-decorator';
import { grossPriceOf, netPriceOf } from '../../common/tax-utils';
import { VendureEntity } from '../base/base.entity';
import { OrderModification } from '../order-modification/order-modification.entity';
import { Order } from '../order/order.entity';

/**
 * @description
 * A Surcharge represents an arbitrary extra item on an {@link Order} which is not
 * a ProductVariant. It can be used to e.g. represent payment-related surcharges.
 *
 * @docsCategory entities
 */
@Entity()
export class Surcharge extends VendureEntity {
    constructor(input?: DeepPartial<Surcharge>) {
        super(input);
    }

    @Column()
    description: string;

    @Column()
    listPrice: number;

    @Column()
    listPriceIncludesTax: boolean;

    @Column()
    sku: string;

    @Column('simple-json')
    taxLines: TaxLine[];

    @ManyToOne(type => Order, order => order.surcharges, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(type => OrderModification, orderModification => orderModification.surcharges)
    orderModification: OrderModification;

    @Calculated()
    get price(): number {
        return this.listPriceIncludesTax ? netPriceOf(this.listPrice, this.taxRate) : this.listPrice;
    }

    @Calculated()
    get priceWithTax(): number {
        return this.listPriceIncludesTax ? this.listPrice : grossPriceOf(this.listPrice, this.taxRate);
    }

    @Calculated()
    get taxRate(): number {
        return summate(this.taxLines, 'taxRate');
    }
}
