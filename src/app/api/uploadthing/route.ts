import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/services/uploadthing/core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
