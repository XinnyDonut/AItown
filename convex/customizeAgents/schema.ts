import { defineSchema, defineTable} from "convex/server";
import { v } from 'convex/values';
import { characters } from "../../data/characters";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    character: v.string(),
    identity: v.string(),
    plan: v.string(),
    createdAt: v.number(),
  }),
  selectedAgents: defineTable({
    agentIds: v.array(v.id("agents")),
    createdAt: v.number(),
  }),
});

//export this table to add to the main convex schema
export const agentTemplatesTable={
  agentTemplates:defineTable({
    name:v.string(),
    createdAt:v.number(),
    agents:v.array(v.object({
      name:v.string(),
      character:v.string(),
      identity:v.string(),
      plan:v.string()
    }))
  })
}