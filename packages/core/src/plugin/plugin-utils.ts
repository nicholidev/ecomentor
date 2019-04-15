import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import proxy from 'http-proxy-middleware';

import { APIExtensionDefinition, VendurePlugin } from '../config';

export interface ProxyOptions {
    route: string;
    port: number;
    hostname?: string;
}

/**
 * Creates a proxy middleware which proxies the given route to the given port.
 * Useful for plugins which start their own servers but should be accessible
 * via the main Vendure url.
 */
export function createProxyHandler(options: ProxyOptions, logging: boolean) {
    const route = options.route.charAt(0) === '/' ? options.route : '/' + options.route;
    const proxyHostname = options.hostname || 'localhost';
    return proxy({
        // TODO: how do we detect https?
        target: `http://${proxyHostname}:${options.port}`,
        pathRewrite: {
            [`^${route}`]: `/`,
        },
        logLevel: logging ? 'info' : 'silent',
    });
}

/**
 * Given an array of VendurePlugins, returns a flattened array of all APIExtensionDefinitions.
 */
export function getPluginAPIExtensions(
    plugins: VendurePlugin[],
    apiType: 'shop' | 'admin',
): APIExtensionDefinition[] {
    const extensions =
        apiType === 'shop'
            ? plugins.map(p => (p.extendShopAPI ? p.extendShopAPI() : undefined))
            : plugins.map(p => (p.extendAdminAPI ? p.extendAdminAPI() : undefined));

    return extensions.filter(notNullOrUndefined);
}
