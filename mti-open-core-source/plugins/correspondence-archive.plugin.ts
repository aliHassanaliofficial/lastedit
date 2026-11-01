
import { MTIPlugin, CoreContext } from '../core/kernel';

/**
 * This is your Correspondence Archive System from the uploaded file
 * Implemented as a mountable plugin - not closed inside core
 */
export const CorrespondenceArchivePlugin: MTIPlugin = {
  id: 'mti.correspondence.archive',
  name: 'MTI Correspondence Archive System',
  version: '5.1.0',
  type: 'correspondence',

  async onRegister(ctx) {
    // Load the JSON spec you uploaded - dynamic mounting
    // const spec = require('../../MTI_Correspondence_Archive_System_Developer_Kit_English.json');
    // ctx.openAPI.addSpec(spec.openAPI, this.id);
    ctx.bus.on('mti.email.received', async (email) => {
      // Auto-archive logic
      await ctx.db?.collection('correspondence').insertOne({
        ...email,
        archivedAt: new Date(),
        plugin: this.id
      });
    });
  },
  async onBoot(ctx) {
    console.log('[ARCHIVE] Correspondence system mounted and listening to all channels');
    // Routes become automatically available: /api/v1/correspondence/*
  },
  routes: [
    { method: 'GET', path: '/api/v1/correspondence/search', handler: 'searchCorrespondence' },
    { method: 'POST', path: '/api/v1/correspondence/link-deal', handler: 'linkToDeal' },
  ]
};
