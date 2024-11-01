import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { api, internal } from "../_generated/api";

export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_and_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();
    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_direct_message", (q) =>
        q.eq("directMessage", directMessage)
      )
      .collect();
    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        const attachment = message.attachment
          ? await ctx.storage.getUrl(message.attachment)
          : undefined;
        return { ...message, attachment, sender };
      })
    );
  },
});

export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id("directMessages"),
    attachment: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { content, attachment, directMessage }) => {
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_direct_message_and_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();
    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    const messageId = await ctx.db.insert("messages", {
      content,
      attachment,
      directMessage,
      sender: ctx.user._id,
    });
    await ctx.scheduler.runAfter(0, internal.function.typing.remove, {
      directMessage,
      user: ctx.user._id,
    });
    await ctx.scheduler.runAfter(0, internal.function.moderation.run, {
      id: messageId,
    });
  },
});

export const deleteMessage = authenticatedMutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error("Message not found");
    }
    if (message.sender !== ctx.user._id) {
      throw new Error("You are not the sender of this message");
    }
    await ctx.db.delete(id);
    if (message.attachment) {
      await ctx.storage.delete(message.attachment);
    }
  },
});

export const generateUploadUrl = authenticatedMutation({
  args: {},
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});
