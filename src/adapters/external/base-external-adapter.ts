
import { MTIPlugin, CoreContext } from '../../core/kernel';

/**
 * Any external system (Bank, GOEIC, EGAC, Cleopatra Factory API, SAP, etc.)
 * plugs here without touching core
 */
export abstract class BaseExternalAdapter implements MTIPlugin {
  abstract id: string; // e.g. 'ext.bank.nbe', 'ext.factory.cleopatra'
  abstract name: string;
  version = '1.0.0';
  type: 'external_adapter' = 'external_adapter';

  async onRegister(ctx: CoreContext) {
    ctx.openAPI.addSpec(this.getOpenAPISpec(), this.id);
  }
  async onBoot(ctx: CoreContext) {
    // Listen to internal events and translate to external calls
    ctx.bus.on('mti.deal.created', (deal) => this.onDealCreated(deal));
    console.log(`[EXTERNAL] Adapter ${this.id} listening`);
  }
  abstract getOpenAPISpec(): any;
  abstract onDealCreated(deal: any): Promise<void>;
  abstract toMTIFormat(externalData: any): any;
  abstract fromMTIFormat(mtiData: any): any;
}
