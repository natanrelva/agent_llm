import { Request, Response } from "express"

export const customerService = (req: Request, res: Response) => {

  try {
    res.status(200).json("ok")
  } catch (error) {
    res.status(500).json({
      error: JSON.stringify(error)
    })
  }

}