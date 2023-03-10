import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ImportInfo, MutationImportProductsArgs, Permission } from '@ecomentor/common/lib/generated-types';

import { Importer } from '../../../data-import/providers/importer/importer';
import { RequestContext } from '../../common/request-context';
import { Allow } from '../../decorators/allow.decorator';
import { Ctx } from '../../decorators/request-context.decorator';

@Resolver('Import')
export class ImportResolver {
    constructor(private importer: Importer) {}

    @Mutation()
    @Allow(Permission.SuperAdmin)
    async importProducts(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationImportProductsArgs,
    ): Promise<ImportInfo> {
        const { createReadStream, filename, mimetype, encoding } = await args.csvFile;
        const stream = createReadStream();
        return this.importer.parseAndImport(stream, ctx).toPromise();
    }
}
