import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
    ActiveOrderService,
    Ctx,
    ID,
    InternalServerError,
    Logger,
    OrderService,
    PaymentMethod,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

import { getGateway } from './braintree-common';
import { braintreePaymentMethodHandler } from './braintree.handler';
import { BRAINTREE_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { BraintreePluginOptions, PaymentMethodArgsHash } from './types';

@Resolver()
export class BraintreeResolver {
    constructor(
        private connection: TransactionalConnection,
        private orderService: OrderService,
        private activeOrderService: ActiveOrderService,
        @Inject(BRAINTREE_PLUGIN_OPTIONS) private options: BraintreePluginOptions,
    ) {}

    @Query()
    async generateBraintreeClientToken(
        @Ctx() ctx: RequestContext,
        @Args() { orderId, includeCustomerId }: { orderId?: ID; includeCustomerId?: boolean },
    ) {
        if (orderId) {
            Logger.warn(
                `The orderId argument to the generateBraintreeClientToken mutation has been deprecated and may be omitted.`,
            );
        }
        const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
        if (!sessionOrder) {
            throw new InternalServerError(
                `Cannot generate Braintree clientToken as there is no active Order.`,
            );
        }
        const order = await this.orderService.findOne(ctx, sessionOrder.id);
        if (order && order.customer) {
            const customerId = order.customer.customFields.braintreeCustomerId ?? undefined;
            const args = await this.getPaymentMethodArgs(ctx);
            const gateway = getGateway(args, this.options);
            try {
                const result = await gateway.clientToken.generate({
                    customerId: includeCustomerId === false ? undefined : customerId,
                });
                return result.clientToken;
            } catch (e) {
                Logger.error(
                    `Could not generate Braintree clientToken. Check the configured credentials.`,
                    loggerCtx,
                );
                throw e;
            }
        } else {
            throw new InternalServerError(`[${loggerCtx}] Could not find a Customer for the given Order`);
        }
    }

    private async getPaymentMethodArgs(ctx: RequestContext): Promise<PaymentMethodArgsHash> {
        const method = (await this.connection.getRepository(ctx, PaymentMethod).find()).find(
            m => m.handler.code === braintreePaymentMethodHandler.code,
        );

        if (!method) {
            throw new InternalServerError(`[${loggerCtx}] Could not find Braintree PaymentMethod`);
        }
        return method.handler.args.reduce((hash, arg) => {
            return {
                ...hash,
                [arg.name]: arg.value,
            };
        }, {} as PaymentMethodArgsHash);
    }
}
