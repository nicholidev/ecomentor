import { RequestContext } from '../../../api/common/request-context';
import { Transitions } from '../../../common/finite-state-machine/types';
import { Order } from '../../../entity/order/order.entity';

/**
 * @description
 * An interface to extend standard {@link OrderState}.
 *
 * @docsCategory orders
 */
export interface CustomOrderStates {}

/**
 * @description
 * These are the default states of the Order process. They can be augmented and
 * modified by using the {@link OrderOptions} `process` property.
 *
 * @docsCategory orders
 */
export type OrderState =
    | 'Created'
    | 'Draft'
    | 'AddingItems'
    | 'ArrangingPayment'
    | 'PaymentAuthorized'
    | 'PaymentSettled'
    | 'PartiallyShipped'
    | 'Shipped'
    | 'PartiallyDelivered'
    | 'Delivered'
    | 'Modifying'
    | 'ArrangingAdditionalPayment'
    | 'Cancelled'
    | keyof CustomOrderStates;

export const orderStateTransitions: Transitions<OrderState> = {
    Created: {
        to: ['AddingItems', 'Draft'],
    },
    Draft: {
        to: ['Cancelled', 'ArrangingPayment'],
    },
    AddingItems: {
        to: ['ArrangingPayment', 'Cancelled'],
    },
    ArrangingPayment: {
        to: ['PaymentAuthorized', 'PaymentSettled', 'AddingItems', 'Cancelled'],
    },
    PaymentAuthorized: {
        to: ['PaymentSettled', 'Cancelled', 'Modifying', 'ArrangingAdditionalPayment'],
    },
    PaymentSettled: {
        to: [
            'PartiallyDelivered',
            'Delivered',
            'PartiallyShipped',
            'Shipped',
            'Cancelled',
            'Modifying',
            'ArrangingAdditionalPayment',
        ],
    },
    PartiallyShipped: {
        to: ['Shipped', 'PartiallyDelivered', 'Cancelled', 'Modifying'],
    },
    Shipped: {
        to: ['PartiallyDelivered', 'Delivered', 'Cancelled', 'Modifying'],
    },
    PartiallyDelivered: {
        to: ['Delivered', 'Cancelled', 'Modifying'],
    },
    Delivered: {
        to: ['Cancelled'],
    },
    Modifying: {
        to: [
            'PaymentAuthorized',
            'PaymentSettled',
            'PartiallyShipped',
            'Shipped',
            'PartiallyDelivered',
            'ArrangingAdditionalPayment',
        ],
    },
    ArrangingAdditionalPayment: {
        to: [
            'PaymentAuthorized',
            'PaymentSettled',
            'PartiallyShipped',
            'Shipped',
            'PartiallyDelivered',
            'Cancelled',
        ],
    },
    Cancelled: {
        to: [],
    },
};

export interface OrderTransitionData {
    ctx: RequestContext;
    order: Order;
}
