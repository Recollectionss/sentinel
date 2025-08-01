export abstract class WorkerAbstract {
  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  protected async try(action: () => Promise<void>) {
    await action();
  }
}
