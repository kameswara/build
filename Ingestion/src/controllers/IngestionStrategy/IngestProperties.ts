/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../../Config";
import { IIngest } from "./IngestionStrategy";
import * as fs from "fs";
import { CallWindow, CampaignProperties, ICampaignProperties } from "transistiondal";

export class IngestProperties implements IIngest {
    public static ParseCallWindows(document: string): Array<CallWindow> {
        try {
            let strRegEx: RegExp = new RegExp("day\\.\\d\\.window\\..*", "gm");
            let matches: RegExpMatchArray = document.match(strRegEx);

            if (!matches) {
                return null;
            }

            let callWindows: Array<CallWindow> = new Array<CallWindow>();
            matches.forEach(match => {
                let cw: CallWindow = new CallWindow();

                let line: string = match.replace("day.", "");
                cw.windowDayOfWeek = Number(line[0]);

                line = line.replace(/\d.window\./gm, "");
                cw.windowNumber = Number(line[0]);

                line = line.replace(/\d\./, "gm");
                if (line.includes("start")) {
                    let time: string = IngestProperties.FindProperty("start", line);
                    if (time) {
                        time = time.replace(":", "");
                        let hour: number = Number("" + time[0] + time[1]);
                        let minute: number = Number("" + time[2] + time[3]);
                        cw.windowStartTime = new Date(Date.UTC(1970, 0, 1, hour, minute, 0, 0));
                        callWindows.push(cw);
                    }
                } else if (line.includes("end")) {
                    let found: boolean = false;
                    callWindows.forEach(x => {
                        if (x.windowDayOfWeek === cw.windowDayOfWeek && x.windowNumber === cw.windowNumber) {
                            cw = x;
                            found = true;
                        }
                    });
                    if (found) {
                        let time: string = IngestProperties.FindProperty("end", line);
                        if (time) {
                            time = time.replace(":", "");
                            let hour: number = Number("" + time[0] + time[1]);
                            let minute: number = Number("" + time[2] + time[3]);
                            cw.windowEndTime = new Date(Date.UTC(1970, 0, 1, hour, minute, 0, 0));
                        }
                    }
                }
            });
            return callWindows;
        } catch (e) {
            throw new Error(e);
        }
    }

    public static ParseHolidays(document: string): Array<Date> {
        try {
            let holidays: Array<Date> = new Array<Date>();
            let holidayProperty: string = IngestProperties.FindProperty("holidays", document);
            if (holidayProperty) {
                let holidayStrings: string[] = holidayProperty.replace(/\\/g, "").split(",");
                holidayStrings.forEach(element => {
                    holidays.push(new Date(element));
                });
            }
            return holidays;
        } catch (e) {
            throw new Error(e);
        }
    }

    public static FindProperty(propertyName: string, document: string): string {
        try {
            let strRegEx: RegExp = new RegExp(propertyName + ".*=.*", "gm");
            let matches: RegExpMatchArray = document.match(strRegEx);

            if (matches != null && matches.length > 0) {
                let finalValue: string = matches[0].replace(propertyName, "");
                finalValue = finalValue.replace("=", "");
                finalValue = finalValue.replace("\r", "");
                return finalValue;
            } else {
                return null;
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    public Ingest(fileLocation: string): Promise<ICampaignProperties> {
        return new Promise<ICampaignProperties>((resolve, reject) => {
            try {
                fs.readFile(fileLocation, "utf-8", function (err: NodeJS.ErrnoException, data: string): void {
                    if (err) {
                        reject(err);
                        return;
                    }

                    data = data.replace(/^#.*/gm, "");
                    let campaignPropertiesMongo: any = CampaignProperties.getModel(config.mongoSettings);
                    let cp: ICampaignProperties = new campaignPropertiesMongo();

                    cp.campaignName = IngestProperties.FindProperty("campaign_name", data);
                    cp.callerIdPhoneNumber = Number(IngestProperties.FindProperty("caller_id_phone_number", data));
                    cp.numberOfCallAttempts = Number(IngestProperties.FindProperty("number_of_call_attempts", data));
                    cp.callWindows = IngestProperties.ParseCallWindows(data);
                    cp.hospitalName = IngestProperties.FindProperty("hospital_name", data);
                    cp.recordingFrequency = Number(IngestProperties.FindProperty("recording_frequency", data));
                    cp.holidays = IngestProperties.ParseHolidays(data);
                    cp.scheduleType = IngestProperties.FindProperty("schedule.type", data);
                    cp.executionId = IngestProperties.FindProperty("executionId", data);

                    cp.validate(valErr => {
                        if (valErr) {
                            reject(valErr);
                            return;
                        } else {
                            resolve(cp);
                            return;
                        }
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}