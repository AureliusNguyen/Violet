import { v } from "convex/values";
import { internal } from "../_generated/api";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internalMutation } from "../_generated/server";

export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    const typingIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_direct_message", (q) =>
        q.eq("directMessage", directMessage)
      )
      .filter((q) => q.neq(q.field("user"), ctx.user._id))
      .collect();
    return await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await ctx.db.get(indicator.user);
        if (!user) {
          throw new Error("User does not exist");
        }
        return user.username;
      })
    );
  },
});

export const upsert = authenticatedMutation({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_direct_message", (q) =>
        q.eq("user", ctx.user._id).eq("directMessage", directMessage)
      )
      .unique();

    const expireAt = Date.now() + 1000 * 5;
    if (existing) {
      await ctx.db.patch(existing._id, { expireAt });
      return existing._id;
    } else {
      const newIndicatorId = await ctx.db.insert("typingIndicators", {
        user: ctx.user._id,
        directMessage,
        expireAt,
      });
      await ctx.scheduler.runAfter(expireAt, internal.function.typing.remove, {
        directMessage,
        user: ctx.user._id,
        expireAt,
      });
      return newIndicatorId;
    }
  },
});

export const remove = internalMutation({
  args: {
    directMessage: v.id("directMessages"),
    user: v.id("users"),
    expireAt: v.optional(v.number()),
  },
  handler: async (ctx, { directMessage, user, expireAt }) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_direct_message", (q) =>
        q.eq("user", user).eq("directMessage", directMessage)
      )
      .unique();
    if (existing && (!expireAt || existing.expireAt === expireAt)) {
      await ctx.db.delete(existing._id);
    }
  },
});
