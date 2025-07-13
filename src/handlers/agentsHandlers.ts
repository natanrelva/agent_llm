import { Request, Response } from "express"

import ollama from "ollama"

export const customerService = async (req: Request, res: Response) => {

  const { messages } = req.body

  const { message } = await ollama.chat({
    model: "llama3.1",
    messages: [{
      role: "user", content: messages
    }]
  })

  try {
    return res.status(200).json(message.content)
  } catch (error) {
    return res.status(500).json({
      error
    })
  }

}

export const SOService = async (req: Request, res: Response) => { 
  
} 