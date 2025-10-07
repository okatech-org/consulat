import { v } from "convex/values";
import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { UserRole, ProfileCategory, ProfileStatus } from "../../lib/constants";
import { countryCodeFromPhoneNumber } from "../../lib/utils";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const handleNewUser = action({
  args: {
    clerkId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    userId: Id<"users">;
    profileId: Id<"profiles"> | undefined;
    message: string;
  }> => {
    try {
      const existingUser = await ctx.runQuery(
        api.functions.users.getUser.getUserByClerkId,
        {
          clerkUserId: args.clerkId,
        }
      );

      if (existingUser) {
        return {
          userId: existingUser._id as Id<"users">,
          profileId: existingUser.profileId as Id<"profiles"> | undefined,
          message: "User already exists",
        };
      }

      const clerkUser = await clerkClient.users.getUser(args.clerkId);

      if (!clerkUser) {
        throw new Error("Failed to fetch user from Clerk");
      }

      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;

      if (!email && !phoneNumber) {
        throw new Error("User must have at least an email or phone number");
      }

      const country = countryCodeFromPhoneNumber(phoneNumber || "");

      if (!country) {
        throw new Error("Could not determine country code from phone number");
      }

      const userId: Id<"users"> = await ctx.runMutation(
        api.functions.users.createUser.createUser,
        {
          userId: args.clerkId,
          email: email,
          phoneNumber: phoneNumber,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          roles: [UserRole.User],
          countryCode: country.code,
        }
      );

      const profileId: Id<"profiles"> = await ctx.runMutation(
        api.functions.profiles.createProfile.createProfile,
        {
          userId: userId,
          category: ProfileCategory.Adult,
          status: ProfileStatus.Active,
          residenceCountry: country.code,
          personal: {
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            birthDate: undefined,
            birthPlace: undefined,
            birthCountry: undefined,
            gender: undefined,
            nationality: undefined,
            maritalStatus: undefined,
            workStatus: undefined,
            acquisitionMode: undefined,
            address: undefined,
          },
          family: {
            father: undefined,
            mother: undefined,
            spouse: undefined,
          },
          emergencyContacts: [],
          professionSituation: {
            profession: undefined,
            employer: undefined,
            employerAddress: undefined,
          },
        }
      );

      try {
        await clerkClient.users.updateUserMetadata(args.clerkId, {
          publicMetadata: {
            profileId: profileId,
            roles: [UserRole.User],
            countryCode: country.code,
            userId: userId,
          },
        });
      } catch (error) {
        console.error("Failed to update Clerk metadata:", error);
      }

      return {
        userId: userId,
        profileId: profileId,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Error in handleNewUser:", error);
      throw error;
    }
  },
});
