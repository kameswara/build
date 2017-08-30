"use strict";
import { IDialer } from "transistiondal";

export interface IDialerProcessResult {
    itemsProcessed: Array<IDialer>;
    itemsErrored: string[];
}

export class DialerProcessResult implements IDialerProcessResult {
    public itemsErrored: Array<string>;
    public itemsProcessed: Array<IDialer>;

    constructor() {
        this.itemsErrored = new Array<string>();
        this.itemsProcessed = new Array<IDialer>();
    }
};