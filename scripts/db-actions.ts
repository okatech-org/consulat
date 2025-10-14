import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ConvexHttpClient } from 'convex/browser';

async function main() {
  const convex = new ConvexHttpClient('https://dapper-guineapig-547.convex.cloud');

  const requests = await convex.query(api.functions.request.getAllRequests, {
    serviceId: 'k57besbz7c6vgc2tfdvgbejnvh7sfn60' as Id<'services'>,
  });

  await Promise.all(
    requests.map(async (request) => {
      console.log('Updating profile', request.profileId);
      await convex.mutation(api.functions.profile.updateProfile, {
        profileId: request.profileId as Id<'profiles'>,
        registrationRequest: request._id,
      });
      console.log('Profile updated', request.profileId);
    }),
  );
}

void main();
