import { logger } from "~/utils/logger";

const STORAGE_NAME = "lucid-lyrics";

const usedNames = __LUCID_DEV_MODE__ ? new Set<string>() : undefined;
export const getName = (name: string) => {
  const fullName = `${STORAGE_NAME}:${name}`;

  if (__LUCID_DEV_MODE__ && usedNames) {
    if (usedNames.has(fullName)) {
      const msg = `Duplicate storage name detected: ${fullName}`;
      logger.error(msg);
    }
    usedNames.add(fullName);
  }

  return fullName;
};
