import { v } from 'convex/values';
import { internalAction } from '../_generated/server';
import { twilio } from '../lib/twilio';

export const sendSms = internalAction({
  args: {
    to: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const status = await twilio.sendMessage(ctx, {
      to: args.to,
      body: args.body,
    });

    return status;
  },
});
