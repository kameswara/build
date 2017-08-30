/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../Config";
import { Model } from "mongoose";
import { DialerActivity, DialerActivityStatus, IDialer, IDialerActivity, IRequest, ISchedule } from "transistiondal";

export interface IDialerActivityBuilder {
    setSeriesId(id: string): void;
    setCampaign(campaign: string): void;
    setDialer(dialer: IDialer): void;
    setSchedule(schedule: ISchedule): void;
    setRequest(request: IRequest): void;
    setStatus(status: string): void;
    getResults(): IDialerActivity;
}

export class DialerActivityBuilder implements IDialerActivityBuilder {
    private _dialerActivity: IDialerActivity;

    public constructor() {
        let dialerActivityMongo: any = DialerActivity.getModel(config.mongoSettings);
        this._dialerActivity = new dialerActivityMongo();
    }

    public setSeriesId(id: string): void {
        this._dialerActivity.seriesId = id;
    }

    public setCampaign(campaign: string): void {
        this._dialerActivity.campaign = campaign;
    }

    public setDialer(dialer: IDialer): void {
        this._dialerActivity.dialer = dialer;
    }

    public setSchedule(schedule: ISchedule): void {
        this._dialerActivity.schedule = schedule;
    }

    public setRequest(request: IRequest): void {
        this._dialerActivity.request = request;
    }

    public setStatus(status: DialerActivityStatus): void {
        this._dialerActivity.status = status;
    }

    public getResults(): IDialerActivity {
        return this._dialerActivity;
    }
}