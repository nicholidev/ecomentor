import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/typeorm';
import { Type } from '@ecomentor/common/lib/shared-types';
import cookieSession = require('cookie-session');
import { Connection, ConnectionOptions, EntitySubscriberInterface } from 'typeorm';
import { InternalServerError } from './common';
import { getConfig, setConfig } from './config/config-helpers';
import { DefaultLogger } from './config';
import { Logger } from './config';
import { RuntimeEcomentorConfig, EcomentorConfig } from './config';
import { Administrator } from './entity';
import { coreEntitiesMap } from './entity/entities';
import { registerCustomEntityFields } from './entity/register-custom-entity-fields';
import { runEntityMetadataModifiers } from './entity/run-entity-metadata-modifiers';
import { setEntityIdStrategy } from './entity/set-entity-id-strategy';
import { validateCustomFieldsConfig } from './entity/validate-custom-fields-config';
import { getConfigurationFunction, getEntitiesFromPlugins } from './plugin/plugin-metadata';
import { getPluginStartupMessages } from './plugin';
import { setProcessContext } from './process-context/process-context';
import { EcomentorWorker } from './worker';
import { NestFactory } from '@nestjs/core';

export type EcomentorBootstrapFunction = (config: EcomentorConfig) => Promise<INestApplication>;

/**
 * @description
 * Bootstraps the Ecomentor server. This is the entry point to the application.
 *
 * @example
 * ```TypeScript
 * import { bootstrap } from '\@ecomentor/core';
 * import { config } from './ecomentor-config';
 *
 * bootstrap(config).catch(err => {
 *     console.log(err);
 * });
 * ```
 * @docsCategory
 * */
export async function bootstrap(userConfig: Partial<EcomentorConfig>): Promise<INestApplication> {
    const config = await preBootstrapConfig(userConfig);
    Logger.useLogger(config.logger);
    Logger.info(`Bootstrapping Ecomentor Server (pid: ${process.pid})...`);

    // The AppModule *must* be loaded only after the entities have been set in the
    // config, so that they are available when the AppModule decorator is evaluated.
    // tslint:disable-next-line:whitespace
    const appModule = await import('./app.module');
    setProcessContext('server');
    const { hostname, port, cors, middleware } = config.apiOptions;
    DefaultLogger.hideNestBoostrapLogs();
    const app = await NestFactory.create(appModule.AppModule, {
        cors,
        logger: new Logger(),
    });
    DefaultLogger.restoreOriginalLogLevel();
    app.useLogger(new Logger());
    const { tokenMethod } = config.authOptions;
    const usingCookie =
        tokenMethod === 'cookie' || (Array.isArray(tokenMethod) && tokenMethod.includes('cookie'));
    if (usingCookie) {
        const { cookieOptions } = config.authOptions;
        app.use(cookieSession(cookieOptions));
    }
    const earlyMiddlewares = middleware.filter(mid => mid.beforeListen);
    earlyMiddlewares.forEach(mid => {
        app.use(mid.route, mid.handler);
    });
    await app.listen(port, hostname || '');
    app.enableShutdownHooks();
    logWelcomeMessage(config);
    return app;
}

/**
 * @description
 * Bootstraps an Ecomentor worker. Resolves to a {@link EcomentorWorker} object containing a reference to the underlying
 * NestJs [standalone application](https://docs.nestjs.com/standalone-applications) as well as convenience
 * methods for starting the job queue and health check server.
 *
 * Read more about the [Ecomentor Worker]({{< relref "Ecomentor-worker" >}}).
 *
 * @example
 * ```TypeScript
 * import { bootstrapWorker } from '\@ecomentor/core';
 * import { config } from './ecomentor-config';
 *
 * bootstrapWorker(config)
 *   .then(worker => worker.startJobQueue())
 *   .then(worker => worker.startHealthCheckServer({ port: 3020 }))
 *   .catch(err => {
 *     console.log(err);
 *   });
 * ```
 * @docsCategory worker
 * */
export async function bootstrapWorker(userConfig: Partial<EcomentorConfig>): Promise<EcomentorWorker> {
    const EcomentorConfig = await preBootstrapConfig(userConfig);
    const config = disableSynchronize(EcomentorConfig);
    config.logger.setDefaultContext?.('Ecomentor Worker');
    Logger.useLogger(config.logger);
    Logger.info(`Bootstrapping Ecomentor Worker (pid: ${process.pid})...`);

    setProcessContext('worker');
    DefaultLogger.hideNestBoostrapLogs();

    const WorkerModule = await import('./worker/worker.module').then(m => m.WorkerModule);
    const workerApp = await NestFactory.createApplicationContext(WorkerModule, {
        logger: new Logger(),
    });
    DefaultLogger.restoreOriginalLogLevel();
    workerApp.useLogger(new Logger());
    workerApp.enableShutdownHooks();
    await validateDbTablesForWorker(workerApp);
    Logger.info('Ecomentor Worker is ready');
    return new EcomentorWorker(workerApp);
}

/**
 * Setting the global config must be done prior to loading the AppModule.
 */
export async function preBootstrapConfig(
    userConfig: Partial<EcomentorConfig>,
): Promise<Readonly<RuntimeEcomentorConfig>> {
    if (userConfig) {
        setConfig(userConfig);
    }

    const entities = await getAllEntities(userConfig);
    const { coreSubscribersMap } = await import('./entity/subscribers');
    setConfig({
        dbConnectionOptions: {
            entities,
            subscribers: [
                // @ts-ignore
                ...(userConfig.dbConnectionOptions?.subscribers ?? []),
                ...(Object.values(coreSubscribersMap) as Array<Type<EntitySubscriberInterface>>),
            ],
        },
    });

    let config = getConfig();
    const entityIdStrategy = config.entityOptions.entityIdStrategy ?? config.entityIdStrategy;
    setEntityIdStrategy(entityIdStrategy, entities);
    const customFieldValidationResult = validateCustomFieldsConfig(config.customFields, entities);
    if (!customFieldValidationResult.valid) {
        process.exitCode = 1;
        throw new Error(`CustomFields config error:\n- ` + customFieldValidationResult.errors.join('\n- '));
    }
    config = await runPluginConfigurations(config);
    registerCustomEntityFields(config);
    await runEntityMetadataModifiers(config);
    setExposedHeaders(config);
    return config;
}

/**
 * Initialize any configured plugins.
 */
async function runPluginConfigurations(config: RuntimeEcomentorConfig): Promise<RuntimeEcomentorConfig> {
    for (const plugin of config.plugins) {
        const configFn = getConfigurationFunction(plugin);
        if (typeof configFn === 'function') {
            config = await configFn(config);
        }
    }
    return config;
}

/**
 * Returns an array of core entities and any additional entities defined in plugins.
 */
export async function getAllEntities(userConfig: Partial<EcomentorConfig>): Promise<Array<Type<any>>> {
    const coreEntities = Object.values(coreEntitiesMap) as Array<Type<any>>;
    const pluginEntities = getEntitiesFromPlugins(userConfig.plugins);

    const allEntities: Array<Type<any>> = coreEntities;

    // Check to ensure that no plugins are defining entities with names
    // which conflict with existing entities.
    for (const pluginEntity of pluginEntities) {
        if (allEntities.find(e => e.name === pluginEntity.name)) {
            throw new InternalServerError(`error.entity-name-conflict`, { entityName: pluginEntity.name });
        } else {
            allEntities.push(pluginEntity);
        }
    }
    return allEntities;
}

/**
 * If the 'bearer' tokenMethod is being used, then we automatically expose the authTokenHeaderKey header
 * in the CORS options, making sure to preserve any user-configured exposedHeaders.
 */
function setExposedHeaders(config: Readonly<RuntimeEcomentorConfig>) {
    const { tokenMethod } = config.authOptions;
    const isUsingBearerToken =
        tokenMethod === 'bearer' || (Array.isArray(tokenMethod) && tokenMethod.includes('bearer'));
    if (isUsingBearerToken) {
        const authTokenHeaderKey = config.authOptions.authTokenHeaderKey;
        const corsOptions = config.apiOptions.cors;
        if (typeof corsOptions !== 'boolean') {
            const { exposedHeaders } = corsOptions;
            let exposedHeadersWithAuthKey: string[];
            if (!exposedHeaders) {
                exposedHeadersWithAuthKey = [authTokenHeaderKey];
            } else if (typeof exposedHeaders === 'string') {
                exposedHeadersWithAuthKey = exposedHeaders
                    .split(',')
                    .map(x => x.trim())
                    .concat(authTokenHeaderKey);
            } else {
                exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
            }
            corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
        }
    }
}

function logWelcomeMessage(config: RuntimeEcomentorConfig) {
    let version: string;
    try {
        version = require('../package.json').version;
    } catch (e) {
        version = ' unknown';
    }
    const { port, shopApiPath, adminApiPath, hostname } = config.apiOptions;
    const apiCliGreetings: Array<readonly [string, string]> = [];
    const pathToUrl = (path: string) => `http://${hostname || 'localhost'}:${port}/${path}`;
    apiCliGreetings.push(['Shop API', pathToUrl(shopApiPath)]);
    apiCliGreetings.push(['Admin API', pathToUrl(adminApiPath)]);
    apiCliGreetings.push(
        ...getPluginStartupMessages().map(({ label, path }) => [label, pathToUrl(path)] as const),
    );
    const columnarGreetings = arrangeCliGreetingsInColumns(apiCliGreetings);
    const title = `Ecomentor server (v${version}) now running on port ${port}`;
    const maxLineLength = Math.max(title.length, ...columnarGreetings.map(l => l.length));
    const titlePadLength = title.length < maxLineLength ? Math.floor((maxLineLength - title.length) / 2) : 0;
    Logger.info(`=`.repeat(maxLineLength));
    Logger.info(title.padStart(title.length + titlePadLength));
    Logger.info('-'.repeat(maxLineLength).padStart(titlePadLength));
    columnarGreetings.forEach(line => Logger.info(line));
    Logger.info(`=`.repeat(maxLineLength));
}

function arrangeCliGreetingsInColumns(lines: Array<readonly [string, string]>): string[] {
    const columnWidth = Math.max(...lines.map(l => l[0].length)) + 2;
    return lines.map(l => `${(l[0] + ':').padEnd(columnWidth)}${l[1]}`);
}

/**
 * Fix race condition when modifying DB
 *
 */
function disableSynchronize(userConfig: Readonly<RuntimeEcomentorConfig>): Readonly<RuntimeEcomentorConfig> {
    const config = { ...userConfig };
    config.dbConnectionOptions = {
        ...userConfig.dbConnectionOptions,
        synchronize: false,
    } as ConnectionOptions;
    return config;
}

/**
 * Check that the Database tables exist. When running Ecomentor server & worker
 * concurrently for the first time, the worker will attempt to access the
 * DB tables before the server has populated them (assuming synchronize = true
 * in config). This method will use polling to check the existence of a known table
 * before allowing the rest of the worker bootstrap to continue.
 * @param worker
 */
async function validateDbTablesForWorker(worker: INestApplicationContext) {
    const connection: Connection = worker.get(getConnectionToken());
    await new Promise<void>(async (resolve, reject) => {
        const checkForTables = async (): Promise<boolean> => {
            try {
                const adminCount = await connection.getRepository(Administrator).count();
                return 0 < adminCount;
            } catch (e) {
                return false;
            }
        };

        const pollIntervalMs = 5000;
        let attempts = 0;
        const maxAttempts = 10;
        let validTableStructure = false;
        Logger.verbose('Checking for expected DB table structure...');
        while (!validTableStructure && attempts < maxAttempts) {
            attempts++;
            validTableStructure = await checkForTables();
            if (validTableStructure) {
                Logger.verbose('Table structure verified');
                resolve();
                return;
            }
            Logger.verbose(
                `Table structure could not be verified, trying again after ${pollIntervalMs}ms (attempt ${attempts} of ${maxAttempts})`,
            );
            await new Promise(resolve1 => setTimeout(resolve1, pollIntervalMs));
        }
        reject(`Could not validate DB table structure. Aborting bootstrap.`);
    });
}
