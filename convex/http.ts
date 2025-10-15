import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';
import { httpAction } from './_generated/server';
import {
  serveFile,
  uploadFileViaHttp,
  handleFileUploadOptions,
  handleFileServeOptions,
} from './storage';
import { internal } from './_generated/api';
import { resend } from './functions/email';
import { twilio } from './lib/twilio';

const http = httpRouter();

// Clerk webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const body = await request.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log(`Processing Clerk webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        await ctx.runMutation(internal.functions.user.updateOrCreateUserInternal, {
          clerkUser: evt.data,
        });
        break;
      case 'user.deleted':
        if (evt.data.id) {
          await ctx.runMutation(internal.functions.user.deleteUserInternal, {
            clerkUserId: evt.data.id,
          });
        }
        break;
      default:
        console.log(`Unhandled Clerk webhook event: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error processing Clerk webhook ${eventType}:`, error);
    return new Response('Webhook processing failed', { status: 500 });
  }

  return new Response('Webhook processed successfully', { status: 200 });
});

// Add Clerk webhook route
http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

// Storage routes (legacy - à utiliser avec les nouvelles fonctions)
http.route({
  path: '/storage/:storageId',
  method: 'GET',
  handler: serveFile,
});

http.route({
  path: '/upload',
  method: 'POST',
  handler: uploadFileViaHttp,
});

http.route({
  path: '/upload',
  method: 'OPTIONS',
  handler: handleFileUploadOptions,
});

// Nouvelles routes pour le stockage de fichiers
http.route({
  path: '/files/upload',
  method: 'POST',
  handler: uploadFileViaHttp,
});

http.route({
  path: '/files/upload',
  method: 'OPTIONS',
  handler: handleFileUploadOptions,
});

http.route({
  path: '/files/serve',
  method: 'GET',
  handler: serveFile,
});

http.route({
  path: '/files/serve',
  method: 'OPTIONS',
  handler: handleFileServeOptions,
});

http.route({
  path: '/resend-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

twilio.registerRoutes(http);

export default http;
