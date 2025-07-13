import express from "express"
import agenteRouters from "./routers/agentsRouters"

const { SERVER_PORT = 3000 } = process.env

const server = express()

server.use(express.json())

server.use("api", agenteRouters)

server.listen(SERVER_PORT, () => {
  console.log(`AGENTE_SERVER | localhost:${SERVER_PORT}`)
})