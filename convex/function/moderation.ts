import { Groq } from "groq-sdk";
import { v } from "convex/values";
import {
  internalAction,
  internalQuery,
  internalMutation,
  mutation,
} from "../_generated/server";
import { internal } from "../_generated/api";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const run = internalAction({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.runQuery(
      internal.function.moderation.getMessage,
      {
        id,
      }
    );
    await ctx.runMutation(internal.function.moderation.deleteMessage, {
      id,
    });

    if (!message) {
      return;
    }
    const result = await groq.chat.completions.create({
      model: "llama-guard-3-8b",
      messages: [{ role: "user", content: message.content }],
    });
    const value = result.choices[0].message.content;

    if (value?.startsWith("unsafe")) {
      await ctx.runMutation(internal.function.moderation.deleteMessage, {
        id,
        reason: value.replace("unsafe", "").trim(),
      });
    }
  },
});

const reasons = {
  S1: "Violent Crimes",
  S2: "Non-Violent Crimes",
};

export const getMessage = internalQuery({
  args: {
    id: v.id("messages"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    return await ctx.db.get(id);
  },
});

export const deleteMessage = internalMutation({
  args: {
    id: v.id("messages"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    await ctx.db.patch(id, {
      deleted: true,
      deletedReason: reason ? reasons[reason as "S1" | "S2"] : undefined,
    });
  },
});
