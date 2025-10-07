import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const deleteUser = mutation({
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
