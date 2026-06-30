import { Router, Response, NextFunction } from "express";
import { LoyaltyService } from "./service";
import { authenticate, AuthRequest } from "../../middleware/auth";

const router = Router();

// Any authenticated user can read their own loyalty standing.
router.use(authenticate);

// GET /api/loyalty — the caller's tier, progress to the next tier, and ladder.
router.get(
  "/",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({
        status: "success",
        data: await LoyaltyService.getStatus(req.user!.id),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
