type Cleanup = () => void;
let active: { name: string; registrations: Cleanup[]; rollback: Cleanup[] } | undefined;

export function pluginInstallation() {
  return active;
}

export function onInstallRollback(restore: Cleanup): void {
  active?.rollback.push(restore);
}

export function trackRegistration(cleanup: Cleanup): Cleanup {
  active?.registrations.push(cleanup);
  return cleanup;
}

function cleanupAll(registrations: Cleanup[], warn: (message: string, error: unknown) => void): void {
  for (let i = registrations.length - 1; i >= 0; i--) {
    try {
      registrations[i]();
    } catch (error) {
      warn("Plugin cleanup error:", error);
    }
  }
}

export function installWithCleanup(name: string, install: () => void | Cleanup, warn: (message: string, error: unknown) => void): Cleanup {
  const previous = active;
  const registrations: Cleanup[] = [];
  const rollback: Cleanup[] = [];
  active = { name, registrations, rollback };
  try {
    const cleanup = install();
    if (typeof cleanup === "function" && !registrations.includes(cleanup)) registrations.push(cleanup);
  } catch (error) {
    cleanupAll(registrations, warn);
    cleanupAll(rollback, warn);
    throw error;
  } finally {
    active = previous;
  }
  rollback.length = 0;
  return () => cleanupAll(registrations, warn);
}
