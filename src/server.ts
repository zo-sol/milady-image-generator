import Fastify from "fastify";
import { generateFromWallet } from "./generateMilady";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.get<{ Params: { address: string } }>("/:address.png", async (req, reply) => {
  const { address } = req.params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return reply.status(400).send({ error: "Invalid wallet address" });
  }

  const buffer = await generateFromWallet(address);

  return reply
    .header("Content-Type", "image/png")
    .header("Cache-Control", "public, max-age=31536000, immutable")
    .send(buffer);
});

app.listen({ port: 3003, host: "0.0.0.0" }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
});
