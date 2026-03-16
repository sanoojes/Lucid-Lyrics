import { APP_NAME, WARN } from "@/constants";
import { $developer_mode } from "@/stores/dev";

export class Logger {
  private prefix: string;
  private isEnabled: boolean = __LUCID_DEV_MODE__ || $developer_mode.get() === "on";
  private unbind: () => void;

  constructor(prefix?: string) {
    const subPrefix = prefix ? `[${prefix.toLowerCase()}]` : "";
    this.prefix = `[${APP_NAME}] ${subPrefix}`;

    this.unbind = $developer_mode.subscribe((value) => {
      this.isEnabled = __LUCID_DEV_MODE__ || value === "on";
    });
  }

  destroy() {
    this.unbind();
  }

  private getPrefixArgs(): [string, string] {
    return [`%c${this.prefix}`, "color: #b2b2b2;"];
  }

  info(...args: unknown[]) {
    if (!this.isEnabled) return;
    const [label, style] = this.getPrefixArgs();
    console.info(label, style, ...args);
  }

  warn(m: string) {
    if (!this.isEnabled) return;
    const [label, style] = this.getPrefixArgs();
    console.warn(`${label} %c${WARN} ${m}`, style, "color: #eab308; font-weight: bold;");
  }

  error(...errors: unknown[]) {
    const [label, style] = this.getPrefixArgs();
    console.error(label, style, ...errors);
  }

  debug(...args: unknown[]) {
    if (!this.isEnabled) return;
    const [label, style] = this.getPrefixArgs();
    console.debug(label, style, ...args);
  }
}

export const createLogger = (prefix?: string) => new Logger(prefix);
export const logger = createLogger("common");
