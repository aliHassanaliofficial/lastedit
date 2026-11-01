
import { MTIPlugin, CoreContext } from '../../core/kernel';

/**
 * Any internal system you build later just implements this
 * Example: HS-Code Engine, Pricing Engine, FOB Calculator, etc.
 */
export abstract class BaseInternalSystem implements MTIPlugin {
  abstract id: string;
  abstract name: string;
  version = '1.0.0';
  type: 'internal' = 'internal';
  dependencies: string[] = ['mti.core'];

  async onRegister(ctx: CoreContext) {
    // Register routes, schemas, events
    ctx.openAPI.addSpec(this.getOpenAPISpec(), this.id);
  }
  async onBoot(ctx: CoreContext) {
    ctx.bus.on(`${this.id}.request`, this.handle.bind(this));
    console.log(`[INTERNAL] ${this.id} ready for mounting`);
  }
  abstract getOpenAPISpec(): any;
  abstract handle(payload: any): Promise<any>;
}
