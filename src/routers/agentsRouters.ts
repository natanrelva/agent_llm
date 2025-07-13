import { Router} from "express";

import { customerService } from "../handlers/agentsHandlers";

const router = Router()

router.post('/customer_service', customerService)

export default  router