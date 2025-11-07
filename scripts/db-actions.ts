import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient('https://dapper-guineapig-547.convex.cloud');

async function main() {
  const memberships = await convex.query(api.functions.membership.getAgentsList, {
    limit: 100,
  });

  for (const membership of memberships.agents) {
    console.log(`Updating profile ${membership._id}`);

    const user = await convex.query(api.functions.user.getUserById, {
      id: membership.userId,
    });

    if (user) {
      console.log(`Updating membership ${membership._id} with user ${user._id}`);
      convex.mutation(api.functions.membership.updateMembership, {
        membershipId: membership._id,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }

  console.log('Done');
}

void main();
