export interface AnimAction {
    type: string;
    delayedBy?: number;
    [key: string]: any;
}
interface ActionWithSelector extends AnimAction {
    selector: string;
}
export interface AnimActionWithClass extends ActionWithSelector {
    className: string;
}
export interface AnimCommandHandler {
    countSteps(args: string, htmlEl?: Element): number;
    parse(args: string): AnimAction[];
    expand?(args: string, container: Element): AnimAction[][];
    init?(args: string, container: Element): void;
}
export interface ActionTypeHandler {
    apply(container: Element, action: AnimAction): void;
    reverse(container: Element, action: AnimAction): void;
    init?(container: Element, action: AnimAction): void;
}
export declare function parseArgs(str: string): string[];
export declare function getAnimCommand(name: string): AnimCommandHandler | undefined;
export declare function registerAnimCommand(name: string, handler: AnimCommandHandler): void;
export declare function listAnimCommands(): string[];
export declare function getAnimActionType(type: string): ActionTypeHandler | undefined;
export declare function registerAnimActionType(type: string, handler: ActionTypeHandler): void;
export declare function listAnimActionTypes(): string[];
export {};
