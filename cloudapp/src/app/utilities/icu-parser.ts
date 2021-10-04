import { LazyTranslateLoader } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateLoader, TranslateModule, TranslateParser } from "@ngx-translate/core";
import { TranslateICUParser } from "ngx-translate-parser-plural-select";

export function CloudAppTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}