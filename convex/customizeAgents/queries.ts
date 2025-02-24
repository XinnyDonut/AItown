// convex/customizeAgents/queries.ts
import { query } from "../_generated/server";
import { QueryCtx } from "../_generated/server";  // 加入 QueryCtx
import { TableNames } from "../_generated/dataModel";

export const getSelectedAgents = query({
  handler: async (ctx: QueryCtx) => {  // 明确指定类型
    return await ctx.db.query("selectedAgents").order("desc").first();
  },
});

export const getAgents = query({
  handler: async (ctx: QueryCtx) => {   // 明确指定类型
    return await ctx.db.query("agents").collect();
  },
});

export const getRecentTemplates = query({
  handler:async (ctx) => {
    return await ctx.db
      .query<'agentTemplates'>('agentTemplates')
      .order('desc')
      .take(10)
  }
})