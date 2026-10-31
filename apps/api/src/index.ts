import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";

const port = Number(process.env.API_PORT ?? 3001);
const app = Fastify({ logger: true });

app.register(cors, { origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true });
app.register(cookie);
app.register(swagger, {
  openapi: { info: { title: "Brightloop Subscription API", version: "0.1.0" } }
});

app.get("/health", async () => ({ status: "ok" }));

async function main(): Promise<void> {
  await app.listen({ port, host: "0.0.0.0" });
}

void main();
