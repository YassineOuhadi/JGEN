import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices
} from 'langium';
import { JgenGeneratedModule, JgenGeneratedSharedModule } from './generated/module';
import { JgenValidator, registerValidationChecks } from './jgen-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type JgenAddedServices = {
    validation: {
        JgenValidator: JgenValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type JgenServices = LangiumServices & JgenAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const JgenModule: Module<JgenServices, PartialLangiumServices & JgenAddedServices> = {
    validation: {
        JgenValidator: () => new JgenValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createJgenServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Jgen: JgenServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        JgenGeneratedSharedModule
    );
    const Jgen = inject(
        createDefaultModule({ shared }),
        JgenGeneratedModule,
        JgenModule
    );
    shared.ServiceRegistry.register(Jgen);
    registerValidationChecks(Jgen);
    return { shared, Jgen };
}