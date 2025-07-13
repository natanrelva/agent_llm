import { Request, Response } from "express"

import ollama from "ollama"

export const customerService = async (req: Request, res: Response) => {

  const { messages } = req.body

  console.log("REQ: ", JSON.stringify(req.body))

  const response = await ollama.chat({
    model: "llama3.1",
    messages: [{
      role: "user", content: messages
    }]
  })

  console.log("RESPONSE: ", JSON.stringify(response))

  try {
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).json({
      error
    })
  }

}