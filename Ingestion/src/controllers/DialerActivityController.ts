/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../Config";
import { DialerActivityBuilder } from "./DialerActivityBuilder";
import * as cache  from "memory-cache";
import * as moment from "moment-timezone";
import { v4 } from "node-uuid";
import { CallWindow, CampaignProperties, DialerActivityStatus, ICampaignProperties, IDialer, IDialerActivity,
    IRequest, ISchedule, MessageType, Request, Schedule } from "transistiondal";
import { logger } from "watsonhealthutils";
import * as WebRequest from "web-request";

export class DialerActivityController {
    public static pruneDNC(dialers: Array<IDialer>): Promise<Array<IDialer>> {
        return new Promise<Array<IDialer>>(async (resolve, reject) => {
            try {
                let uri: string = config.internalAPILocation + "prunednc";
                logger.debug("POST: " + uri);
                resolve(await DialerActivityController.postJson<Array<IDialer>>(uri, { throwResponseError: true }, dialers));
                return;
            } catch (e) {
                if (e instanceof WebRequest.ResponseError) {
                    e.message = e.message + " | " + e.response.body;
                    reject(e);
                } else {
                    reject(e);
                }
            }
        });
    }

    public static async postJson<T>(uri: string, options?: WebRequest.RequestOptions, content?: any): Promise<T> {
        return (await WebRequest.create<T>(uri, Object.assign({}, options, { json: true, method: "POST" }), content).response).content;
    }

    public static BuildDialerActivity(dialer: IDialer, status: DialerActivityStatus): Promise<IDialerActivity> {
        return new Promise<IDialerActivity>(async (resolve, reject) => {
            try {
                if (!dialer) {
                    reject("Cannot build dialer activity. The dialer is null.");
                    return;
                }

                let dialerActivityBuilder: DialerActivityBuilder = new DialerActivityBuilder();
                dialerActivityBuilder.setDialer(dialer);
                dialerActivityBuilder.setSeriesId(v4());

                let campaignProperty: ICampaignProperties = await DialerActivityController.GetCampaignProperties(dialer.dialerCampaignID);
                dialerActivityBuilder.setCampaign(campaignProperty.campaignName);

                let schedule: ISchedule = await DialerActivityController.BuildSchedule(campaignProperty, dialer.timeZone);
                dialerActivityBuilder.setSchedule(schedule);

                let request: IRequest = await DialerActivityController.BuildRequest(dialer, campaignProperty, schedule);
                dialerActivityBuilder.setRequest(request);

                dialerActivityBuilder.setStatus(status);

                let dialerActivity: IDialerActivity = dialerActivityBuilder.getResults();
                dialerActivity.validate(err => {
                    if (err) {
                        reject("Cannot build dialer activity. " + err);
                        return;
                    } else {
                        resolve(dialerActivity);
                        return;
                    }
                });
            } catch (err) {
                reject(err);
                return;
            }
        });
    }

    // !CACHED
    public static BuildSchedule(campaignProperty: ICampaignProperties, timezone: string): Promise<ISchedule> {
        return new Promise<ISchedule>(async (resolve, reject) => {
            try {
                if (!campaignProperty) {
                    reject("Cannot build schedule without Campaign Properties");
                    return;
                }
                if (!timezone) {
                    reject("Cannot build schedule without timezone");
                    return;
                }
                campaignProperty.campaignName = encodeURIComponent(campaignProperty.campaignName);
                timezone = encodeURIComponent(timezone);
                let cn: string = encodeURIComponent(campaignProperty.campaignName);
                let uri: string = config.internalAPILocation + "schedule?campaignname=" +
                    cn + "&timezone=" + timezone + "&attemptnumber=1";

                let scheduleMongo: any = Schedule.getModel(config.mongoSettings);
                let cachedSchedule: string = cache.get("schedule_" + uri);
                let schedule: ISchedule;
                if (cachedSchedule) {
                    schedule = new scheduleMongo(JSON.parse(cachedSchedule));
                    logger.debug("From Cache: " + uri);
                } else {
                    schedule = new scheduleMongo(await WebRequest.json<ISchedule>(uri, { throwResponseError: true }));
                    if (schedule) {
                        let window: number = schedule.windowEndTime.getTime() - new Date().getTime();
                        cache.put("schedule_" + uri, JSON.stringify(schedule), window); // Cached until the window ends
                        logger.debug("GET: " + uri);
                    } else {
                        reject("No sechedule found: " + uri);
                        return;
                    }
                }
                // For the sake of window distribution we will pick a random time within the window.
                schedule.windowStartTime = new Date(schedule.windowStartTime.getTime() + Math.random() *
                    (schedule.windowEndTime.getTime() - schedule.windowStartTime.getTime()));
                resolve(schedule);
                return;
            } catch (e) {
                if (e instanceof WebRequest.ResponseError) {
                    e.message = e.message + " | " + e.response.body;
                    reject(e);
                } else {
                    reject(e);
                }
            }
        });
    }

    public static BuildRequest(dialer: IDialer, campaignProperty: ICampaignProperties, schedule: ISchedule): Promise<IRequest> {
        return new Promise<IRequest>((resolve, reject) => {
            try {
                if (!dialer) {
                    reject("Cannot build request. The dialer is null.");
                    return;
                }
                if (!campaignProperty) {
                    reject("Cannot build request. The campaign Properties are null.");
                    return;
                }
                if (!schedule) {
                    reject("Cannot build request. The schedule is null.");
                    return;
                }

                let requestMongo: any = Request.getModel(config.mongoSettings);
                let req: IRequest = new requestMongo();
                req.callReferenceId = v4();
                req.outboundNumber = dialer.phoneNumber;
                req.notificationType = 1;
                req.callBackNumber = campaignProperty.callerIdPhoneNumber;
                req.messageType = MessageType.VXML;
                req.message = config.vxmlLocation + "/" + campaignProperty.campaignName +
                    ".vxml?firstName=" + dialer.firstName + "&lastName=" + dialer.lastName;
                req.startSchedule = schedule.windowStartTime;
                req.endSchedule = schedule.windowEndTime;
                req.executionId = campaignProperty.executionId;

                req.validate(err => {
                    if (err) {
                        reject("Cannot build request. " + err);
                        return;
                    } else {
                        resolve(req);
                        return;
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    // !CACHED
    public static GetCampaignProperties(campaignName: string): Promise<ICampaignProperties> {
        return new Promise<ICampaignProperties>(async (resolve, reject) => {
            try {
                campaignName = encodeURIComponent(campaignName);
                let uri: string = config.internalAPILocation +
                    "properties?campaignname=" + campaignName;

                let campaignPropertiesMongo: any = CampaignProperties.getModel(config.mongoSettings);
                let cachedCampaignProperties: string = cache.get("CampaignProperties_" + uri);
                if (cachedCampaignProperties) {
                    let c: ICampaignProperties = new campaignPropertiesMongo(JSON.parse(cachedCampaignProperties));
                    logger.debug("From Cache: " + uri);
                    resolve(c);
                    return;
                } else {
                    let campaign: ICampaignProperties = new campaignPropertiesMongo(
                        await WebRequest.json<ICampaignProperties>(uri, { throwResponseError: true }));
                    if (campaign.campaignName) {
                        cache.put("CampaignProperties_" + uri, JSON.stringify(campaign), 86400000); // One day
                        logger.debug("GET: " + uri);
                        resolve(campaign);
                        return;
                    } else {
                        reject("No Campaign Properties found for: " + uri);
                        return;
                    }
                }
            } catch (e) {
                if (e instanceof WebRequest.ResponseError) {
                    e.message = e.message + " | " + e.response.body;
                    reject(e);
                } else {
                    reject(e);
                }
            }
        });
    }
}