import { components } from '../_generated/api';
import { Resend } from '@convex-dev/resend';
import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';

export const resend: Resend = new Resend(components.resend, {});

export const sendTestEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: `Consulat.ga <${process.env.RESEND_SENDER}>`,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
  },
});

export const sendEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: `Consulat.ga <${process.env.RESEND_SENDER}>`,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
  },
});
