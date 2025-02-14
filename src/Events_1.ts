import { EventClass, TEvHandler } from "./core/EventQueue_1";
/**
 * The EventEmitter Class
 */
export class EventEmitter extends EventClass {
  constructor(private prefix: string = "") {
    super();
  }

  /**
   * Add an event listener
   */
  public override addListener(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.addListener(name, handler);
  }
  /**
   * Remove an event listener
   */
  public override removeListener(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.removeListener(name, handler);
  }
  /**
   * Add a single use event listener
   * (the listener gets internally removed from the stack after it has been executed)
   */
  public override addSingleUseListener(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.addSingleUseListener(name, handler);
  }
  /**
   * Add a single use event listener
   * (the listener gets internally removed from the stack after it has been executed)
   */
  public once(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.addSingleUseListener(name, handler);
  }
  /**
   * Add an event listener
   */
  public on(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.addListener(name, handler);
  }
  /**
   * Remove an event listener
   */
  public off(id: string, handler: TEvHandler) {
    const name = this.prefix + id;
    super.removeListener(name, handler);
  }
  /**
   * Remove all event listeners belogning to the specified event
   */
  public override removeAllListeners(name: string): void {
    super.removeAllListeners(name);
  }
  /**
   * Emit an event
   */
  public override emit(id: string, ..._data: any | any[]) {
    const name = this.prefix + id;
    return super.emit(name, ..._data);
  }
}