import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { getDefaultLanguage } from '../../../common/utilities/get-default-language';
import { LanguageCode } from '../../../data/types/gql-generated-types';

@Injectable()
export class I18nService {
    constructor(private ngxTranslate: TranslateService) {
        // For some unknown reason, calling `setDefaultLang(getDefaultLanguage())`
        // produces a stack overflow in some cases, wheras assigning an intermediate
        // var does not. ¯\_(ツ)_/¯
        const defaultLang = getDefaultLanguage();
        // TODO: this constructor is called many times on bootstrap. Investigate why and fix.
        ngxTranslate.setDefaultLang(defaultLang);
    }

    /**
     * Set the UI language
     */
    setLanguage(language: LanguageCode): void {
        this.ngxTranslate.use(language);
    }

    /**
     * Translate the given key.
     */
    translate(key: string | string[], params?: any): string {
        return this.ngxTranslate.instant(key, params);
    }
}
