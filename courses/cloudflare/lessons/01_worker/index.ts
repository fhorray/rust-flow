export default {
  async fetch(request: Request): Promise<Response> {
    // TODO: Return "Hello Cloudflare"
    return new Response("Hello");
  },
};
