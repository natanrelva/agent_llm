import express from "express"
const { SERVER_PORT = 3000 } = process.env

const server = express()

server.use(express.json())

server.listen(SERVER_PORT, () => {
  console.log(`AGENTE_SERVER | localhost:${SERVER_PORT}`)
})