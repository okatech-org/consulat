import * as fs from 'fs';
import * as path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
const convex = new ConvexHttpClient('');

async function generateProfileClerkMap() {
  console.log('Generating Profile ID -> Clerk ID map...');
  const usersDataPath = path.join(process.cwd(), 'data/exports/users-data.json');
  const outputPath = path.join(process.cwd(), 'data/exports/profile-clerk-map.json');

  if (!fs.existsSync(usersDataPath)) {
    console.error(`File not found: ${usersDataPath}`);
    return;
  }

  try {
    const rawData = fs.readFileSync(usersDataPath, 'utf-8');
    const usersData = JSON.parse(rawData);
    console.log(`Processing ${usersData.length} users...`);

    const profileMap: Record<string, string> = {};
    let count = 0;
    let skipped = 0;

    for (const user of usersData) {
      if (user.profile && user.profile.id && user.clerkId) {
        console.log(`Processing ${user.id}`);
        const userDetails = await convex.query(api.functions.user.getUserByClerkId, {
          clerkUserId: user.clerkId,
        });

        if (userDetails?.profileId) {
          console.log('user profile id found and adding to map');

          profileMap[user.profile.id] = userDetails?.profileId;
          count++;
        }
      } else {
        skipped++;
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(profileMap, null, 2));

    console.log(`\nSuccess!`);
    console.log(`Mapped: ${count} users`);
    console.log(`Skipped: ${skipped} users (missing profile or clerkId)`);
    console.log(`Output written to: ${outputPath}`);
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

void generateProfileClerkMap();
