// ============================================================
// Extension Plugin Interface
// ============================================================
// This is the contract that Branch modules implement to hook
// into Trunk entities. The Trunk never imports Branch code —
// instead, Branches register plugins at startup.
// See: Doc 04 §4
// ============================================================

/**
 * Interface for industry-specific extension plugins.
 * Each extensible Trunk entity (Project, Task, DailyReport, Equipment)
 * exposes a Registry that accepts plugins implementing this interface.
 */
export interface ExtensionPlugin<TExtensions = Record<string, unknown>> {
  /** The industry this plugin handles (e.g., 'CONSTRUCTION') */
  readonly industry: string;

  /** Validate the extensions payload before saving to DB */
  validateExtensions(data: unknown): Promise<TExtensions>;

  /** Hook called after the parent entity is created */
  onCreated?(entityId: string, extensions: TExtensions): Promise<void>;

  /** Hook called after the parent entity is updated */
  onUpdated?(entityId: string, extensions: TExtensions): Promise<void>;

  /** Hook called after the parent entity is deleted */
  onDeleted?(entityId: string): Promise<void>;
}

/**
 * Generic registry that Trunk modules use to manage Branch plugins.
 * Trunk services call registry.getPlugin(industry) to validate extensions.
 */
export class ExtensionRegistry<T = Record<string, unknown>> {
  private plugins = new Map<string, ExtensionPlugin<T>>();

  register(plugin: ExtensionPlugin<T>): void {
    this.plugins.set(plugin.industry, plugin);
  }

  getPlugin(industry: string): ExtensionPlugin<T> | undefined {
    return this.plugins.get(industry);
  }

  hasPlugin(industry: string): boolean {
    return this.plugins.has(industry);
  }

  getRegisteredIndustries(): string[] {
    return Array.from(this.plugins.keys());
  }
}
