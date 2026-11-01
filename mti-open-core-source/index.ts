
import { PluginRegistry, OpenAPIAggregator, EventBus, CoreContext } from './core/kernel';
import { CorrespondenceArchivePlugin } from './plugins/correspondence-archive.plugin';

/**
 * BOOT - Open Core - Nothing is hardcoded closed
 */
async function bootMTI() {
  const bus = new EventBus();
  const registry = new PluginRegistry();
  const openAPI = new OpenAPIAggregator();
  const ctx: CoreContext = { bus, registry, openAPI, db: null, settings: {} };

  // Core always first
  // Then mount whatever you have - today 1 plugin, tomorrow 100 plugins

  // 1. Your uploaded systems - mounting dynamically
  await registry.register(CorrespondenceArchivePlugin, ctx);

  // 2. Future internal systems - just add a line - core stays open
  // await registry.register(new HSCodeEngine(), ctx);
  // await registry.register(new FOBCalculator(), ctx);
  // await registry.register(new WaterfallProtocol(), ctx);

  // 3. Future external adapters - just add a line
  // await registry.register(new NBEBankAdapter(), ctx);
  // await registry.register(new CleopatraFactoryAdapter(), ctx);

  await registry.bootAll(ctx);

  console.log('=== MTI OPEN CORE BOOTED ===');
  console.log('Mounted plugins:', registry.list());
  console.log('Unified OpenAPI:', Object.keys(openAPI.getUnifiedSpec().paths).length, 'routes');
  console.log('Core is OPEN - ready for internal mount and external link');
}

bootMTI();
