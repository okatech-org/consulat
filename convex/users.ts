import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { countryCodeFromPhoneNumber } from "./lib/utils";

export const updateOrCreateUser = internalMutation({
  args: {
    clerkUser: v.any(), // Données de l'utilisateur depuis Clerk
  },
  handler: async (ctx, args) => {
    const { clerkUser } = args;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", clerkUser.id))
      .first();

    const email = clerkUser.email_addresses?.[0]?.email_address;
    const phoneNumber = clerkUser.phone_numbers?.[0]?.phone_number;
    const countryCodeData = countryCodeFromPhoneNumber(phoneNumber);

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      await ctx.db.patch(existingUser._id, {
        firstName: clerkUser.first_name || existingUser.firstName,
        lastName: clerkUser.last_name || existingUser.lastName,
        email: email || existingUser.email,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Créer un nouvel utilisateur
      const newUserId = await ctx.db.insert("users", {
        userId: clerkUser.id,
        legacyId: undefined,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        email: email,
        phoneNumber: phoneNumber,
        roles: ["user"],
        status: "active",
        profileId: undefined,
        countryCode: countryCodeData?.code,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      });
      return newUserId;
    }
  },
});

export const deleteUser = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkUserId } = args;

    // Trouver l'utilisateur par userId
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", clerkUserId))
      .first();

    if (user) {
      // Marquer l'utilisateur comme supprimé (soft delete)
      await ctx.db.patch(user._id, {
        status: "deleted",
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return true;
    }

    return false;
  },
});
