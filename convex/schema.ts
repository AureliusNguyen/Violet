import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    image: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]).index("by_username", ["username"]),
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    status: v.union(
      v.literal("accepted"),
      v.literal("pending"),
      v.literal("rejected")
    ),
  })
    .index("by_user_1_status", ["user1", "status"])
    .index("by_user_2_status", ["user2", "status"]),
  messages: defineTable({
    sender: v.string(),
    content: v.string(),
  }),
});
