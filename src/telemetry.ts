import type { TelemetryEvent, TelemetryData, GhostChatConfig } from "./types";

/**
 * Simple telemetry logger
 * Can be extended to support OpenTelemetry exporters
 */
class Telemetry {
  private enabled: boolean = false;
  private endpoint?: string;

  init(config: GhostChatConfig): void {
    this.enabled = config.telemetry?.enabled ?? false;
    this.endpoint = config.telemetry?.endpoint;

    if (this.enabled) {
      console.log("[GhostChat] Telemetry enabled");
    }
  }

  track(event: TelemetryEvent, data?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const telemetryData: TelemetryData = {
      event,
      timestamp: Date.now(),
      data,
    };

    // Log to console by default
    console.log("[GhostChat Telemetry]", telemetryData);

    // If endpoint provided, send to remote (future enhancement)
    if (this.endpoint) {
      this.sendToEndpoint(telemetryData).catch((error) => {
        console.warn("[GhostChat] Failed to send telemetry:", error);
      });
    }
  }

  private async sendToEndpoint(data: TelemetryData): Promise<void> {
    if (!this.endpoint) return;

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Silent fail - telemetry should not break the app
      console.debug("[GhostChat] Telemetry send failed:", error);
    }
  }
}

export const telemetry = new Telemetry();
