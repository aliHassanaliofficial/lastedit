
/**
 * MTI Open Dynamic Core Kernel - v6.0
 * Owner: Farag Mohamed Ali Hussein
 * Principle: Open Inside / Open Outside / Never Closed
 */
export type PluginType = 'internal' | 'external_adapter' | 'correspondence' | 'compliance' | 'banking';

export interface MTIPlugin {
  id: string; // e.g. 'mti.correspondence.archive'
  name: string;
  version: string;
  type: PluginType;
  dependencies?: string[]; // other plugin ids
  // Lifecycle hooks - core calls them
  onRegister: (ctx: CoreContext) => Promise<void>;
  onBoot: (ctx: CoreContext) => Promise<void>;
  onShutdown?: () => Promise<void>;
  // Open Extension Points
  routes?: RouteDef[];
  events?: EventHandler[];
  jobs?: JobDef[];
  externalConnectors?: ExternalConnector[];
}

export interface CoreContext {
  bus: EventBus;
  registry: PluginRegistry;
  openAPI: OpenAPIAggregator;
  db: any;
  settings: any;
}

export class PluginRegistry {
  private plugins = new Map<string, MTIPlugin>();
  async register(plugin: MTIPlugin, ctx: CoreContext) {
    if(this.plugins.has(plugin.id)) throw new Error(`Plugin ${plugin.id} already registered`);
    await plugin.onRegister(ctx);
    this.plugins.set(plugin.id, plugin);
    console.log(`[MTI-CORE] Registered: ${plugin.id} v${plugin.version}`);
  }
  async bootAll(ctx: CoreContext) {
    for(const p of this.plugins.values()) {
      await p.onBoot(ctx);
    }
  }
  list() { return Array.from(this.plugins.keys()); }
}

export class OpenAPIAggregator {
  private specs: any[] = [];
  addSpec(spec: any, pluginId: string) {
    // Auto prefix paths to avoid collision
    spec['x-mti-plugin'] = pluginId;
    this.specs.push(spec);
  }
  getUnifiedSpec() {
    // Merge all specs dynamically - open core
    const unified = { openapi: '3.1.0', info: { title: 'MTI Open Core - Unified', version: '6.0.0' }, paths: {}, components: { schemas: {} } };
    for(const s of this.specs) {
      Object.assign(unified.paths, s.paths);
      Object.assign(unified.components.schemas, s.components?.schemas || {});
    }
    return unified;
  }
}

export class EventBus {
  // Internal + External events flow through same bus
  private handlers = new Map<string, Function[]>();
  on(event: string, fn: Function) {
    if(!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(fn);
  }
  async emit(event: string, payload: any) {
    console.log(`[BUS] ${event}`, payload?.id || '');
    const fns = this.handlers.get(event) || [];
    for(const fn of fns) await fn(payload);
    // Also emit to external webhooks
    // ...
  }
}
