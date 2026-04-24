import { defaultMaidCardRuleSet } from "../src/games/maid-card/data";

export default {
  async fetch(request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/games/maid-card/rules") {
      return Response.json(defaultMaidCardRuleSet, {
        headers: {
          "cache-control": "public, max-age=300",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler;
