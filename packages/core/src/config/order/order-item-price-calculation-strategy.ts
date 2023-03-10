import { RequestContext } from '../../api/common/request-context';
import { PriceCalculationResult } from '../../common/types/common-types';
import { InjectableStrategy } from '../../common/types/injectable-strategy';
import { Order } from '../../entity/order/order.entity';
import { ProductVariant } from '../../entity/product-variant/product-variant.entity';

/**
 * @description
 * The OrderItemPriceCalculationStrategy defines the price of an OrderItem. By default the
 * {@link DefaultOrderItemPriceCalculationStrategy} is used.
 *
 * ### When is the strategy invoked ?
 * * addItemToOrder (only on the new order line)
 * * adjustOrderLine  (only on the adjusted order line)
 * * setOrderShippingAddress (on all order lines)
 * * setOrderBillingAddress (on all order lines)
 *
 * ### OrderItemPriceCalculationStrategy vs Promotions
 * Both the OrderItemPriceCalculationStrategy and Promotions can be used to alter the price paid for a product.
 *
 * Use OrderItemPriceCalculationStrategy if:
 *
 * * The price is not dependent on quantity or on the other contents of the Order.
 * * The price calculation is based on the properties of the ProductVariant and any CustomFields
 *   specified on the OrderLine, for example via a product configurator.
 * * The logic is a permanent part of your business requirements.
 *
 * Use Promotions if:
 *
 * * You want to implement "discounts" and "special offers"
 * * The calculation is not a permanent part of your business requirements.
 * * The price depends on dynamic aspects such as quantities and which other
 *   ProductVariants are in the Order.
 * * The configuration of the logic needs to be manipulated via the Admin UI.
 *
 * ### Example use-cases
 *
 * A custom OrderItemPriceCalculationStrategy can be used to implement things like:
 *
 * * A gift-wrapping service, where a boolean custom field is defined on the OrderLine. If `true`,
 *   a gift-wrapping surcharge would be added to the price.
 * * A product-configurator where e.g. various finishes, colors, and materials can be selected and stored
 *   as OrderLine custom fields (see [Customizing models](/docs/developer-guide/customizing-models/#configurable-order-products).
 *
 * @docsCategory Orders
 */
export interface OrderItemPriceCalculationStrategy extends InjectableStrategy {
    /**
     * @description
     * Receives the ProductVariant to be added to the Order as well as any OrderLine custom fields and returns
     * the price for a single unit.
     *
     * Note: if you have any `relation` type custom fields defined on the OrderLine entity, they will only be
     * passed in to this method if they are set to `eager: true`.
     */
    calculateUnitPrice(
        ctx: RequestContext,
        productVariant: ProductVariant,
        orderLineCustomFields: { [key: string]: any },
        order: Order,
    ): PriceCalculationResult | Promise<PriceCalculationResult>;
}
