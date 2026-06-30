import { Router, Response, NextFunction } from "express";
import { RestockService } from "./service";
import { authenticate, authorize, AuthRequest } from "../../middleware/auth";
import prisma from "../../config/database";

const router = Router();

// Replenishment intelligence is a purchasing decision → ADMIN + MANAGER only.
router.use(authenticate);
router.use(authorize(["ADMIN", "MANAGER"]));

// GET /api/restock/forecast — predicted stockouts + suggested reorder per spot.
// A MANAGER is locked to the boutique they manage; ADMIN sees the whole network
// (optionally narrowed with ?spotId=).
router.get(
  "/forecast",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let spotId =
        typeof req.query.spotId === "string" ? req.query.spotId : null;

      if (req.user?.role === "MANAGER") {
        const managed = await prisma.vendingSpot.findUnique({
          where: { managerId: req.user.id },
          select: { id: true },
        });
        // A manager only ever sees their own spot — a sentinel id yields an
        // empty board if they manage none, never the whole network.
        spotId = managed?.id ?? "__none__";
      }

      res.json({
        status: "success",
        data: await RestockService.getForecast(spotId),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
