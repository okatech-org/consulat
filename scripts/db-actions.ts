import { api } from '@/convex/_generated/api';
import { CountryCode } from '@/convex/lib/constants';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient('https://dapper-guineapig-547.convex.cloud');

async function main() {
  console.log('Hello, world!');
  const profiles = await convex.query(api.functions.profile.getAllProfiles, {});

  for (const profile of profiles) {
    if (profile.personal?.nationality === ('gabon' as CountryCode)) {
      console.log(`Updating profile ${profile._id}`);
      await convex.mutation(api.functions.profile.updateProfile, {
        profileId: profile._id,
        personal: {
          nationality: CountryCode.GA,
        },
      });
    }
  }

  console.log('Done');
}

void main();
