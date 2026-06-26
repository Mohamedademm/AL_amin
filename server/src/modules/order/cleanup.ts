import prisma from "../../config/database";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // every 30 minutes

let intervalHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the order cleanup scheduler that runs every 30 minutes:
 * - Deletes REFUSED orders older than 2 days.
 * - Logs SHIPPING orders stuck for more than 5 days.
 */
export function startOrderCleanup() {
  if (intervalHandle) return;
  intervalHandle = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
  runCleanup(); // immediate first run
}

export function stopOrderCleanup() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

async function runCleanup() {
  const now = new Date();

  // 1. Delete REFUSED orders older than 2 days.
  try {
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const deleted = await prisma.order.deleteMany({
      where: { status: "REFUSED", updatedAt: { lt: twoDaysAgo } },
    });
    if (deleted.count > 0) {
      console.log(
        `[cleanup] Deleted ${deleted.count} REFUSED order(s) older than 2 days`,
      );
    }
  } catch (err) {
    console.error("[cleanup] REFUSED expiry failed:", err);
  }

  // 2. Flag SHIPPING orders stuck for more than 5 days.
  // Silently skips if the SHIPPING enum value doesn't exist yet (pending migration).
  try {
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const stuck = await prisma.order.findMany({
      where: { status: "SHIPPING", updatedAt: { lt: fiveDaysAgo } },
      select: { id: true, updatedAt: true },
    });
    if (stuck.length > 0) {
      console.warn(
        `[cleanup] ${stuck.length} SHIPPING order(s) overdue for delivery: ${stuck.map((o) => o.id.slice(0, 8)).join(", ")}`,
      );
    }
  } catch (err: any) {
    // P2007 = invalid enum value (migration not yet applied) — skip silently.
    if (err?.code !== "P2007") {
      console.error("[cleanup] SHIPPING overdue check failed:", err);
    }
  }
}
