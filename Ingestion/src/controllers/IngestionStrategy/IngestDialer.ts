/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../../Config";
import { DialerProcessResult, IDialerProcessResult } from "../../models/IDialerProcessResult";
import { DialerActivityController } from "../DialerActivityController";
import { IIngest } from "./IngestionStrategy";
import * as fs from "fs";
import { Dialer, ICampaignProperties, IDialer } from "transistiondal";
import { logger } from "watsonhealthutils";

export class IngestDialer implements IIngest {
    private static _parseFromArray(arrayToParse: Array<string>): IDialer {
        let dialerMongo: any = Dialer.getModel(config.mongoSettings);
        let d: IDialer = new dialerMongo();
        d.vendorLeadCode = arrayToParse[0];
        d.callBatchID = arrayToParse[2];
        d.phoneCountryCode = Number(arrayToParse[3]);
        d.phoneNumber = Number(arrayToParse[4]);
        d.firstName = arrayToParse[6];
        d.lastName = arrayToParse[8];
        d.timeZone = this._convertToTimezone(arrayToParse[25]);
        d.dialerMediaID = arrayToParse[27];
        d.dialerCampaignID = arrayToParse[28];
        d.dialerContractID = arrayToParse[29];

        return d;
    }

    private static _convertToTimezone(timeZoneString: string): string {
        switch (timeZoneString) {
            case "Pacific Standard Time":
                return "America/Los_Angeles";
            case "Mountain Standard Time":
                return "America/Denver";
            case "Central Standard Time":
                return "America/Chicago";
            case "Eastern Standard Time":
                return "America/New_York";
            default:
                logger.error("Invalid Time Zone: " + timeZoneString);
                return null;
        }
    }

    private static _validateDialer(dialer: IDialer): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                await DialerActivityController.GetCampaignProperties(dialer.dialerCampaignID);

                dialer.validate(valErr => {
                    if (valErr) {
                        logger.error("Invalid Dialer entry " + dialer + " ERROR: " + valErr);
                        resolve(valErr);
                    } else {
                        resolve(true);
                    }
                });
            } catch (e) {
                logger.error("Invalid Dialer entry " + dialer + " ERROR: " + e);
                resolve(e);
            }
        });
    }

    public Ingest(fileLocation: string): Promise<IDialerProcessResult> {
        return new Promise<IDialerProcessResult>((resolve, reject) => {
            try {
                fs.readFile(fileLocation, "utf-8", function (err: NodeJS.ErrnoException, data: string): void {
                    if (err) {
                        reject(err);
                        return;
                    }

                    data = data.replace(/\r/g, "");
                    data = data.trim();
                    let lines: string[] = data.split(/\n/);
                    let errorLines: string[] = [];

                    if (!lines[lines.length - 1]) {
                        lines.splice(lines.length - 1, 1);
                    }

                    let dialerEntries: Array<IDialer> = new Array<IDialer>();
                    Promise.all(lines.map(line => {
                        return new Promise<void>(async (innerResolve, innerReject) => {
                            let fields: string[] = line.split("|");

                            if (fields.length !== 30) {
                                logger.debug("Invalid Dialer entry: " + line);
                                errorLines.push(line);
                                innerResolve();
                                return;
                            }

                            let dialer: IDialer = IngestDialer._parseFromArray(fields);

                            if (config.testingPhoneNumberOverride && (process.env.environment === config.environments.development.toString() ||
                                process.env.environment === config.environments.qa.toString() ||
                                process.env.environment === config.environments.model.toString())) {
                                dialer.phoneNumber = config.testingPhoneNumberOverride;
                            }

                            let valid: any = await IngestDialer._validateDialer(dialer);
                            if (valid !== true) {
                                errorLines.push(line);
                                innerResolve();
                                return;
                            }

                            dialerEntries.push(dialer);
                            innerResolve();
                            return;
                        });
                    })).then(() => {
                        let returnObj: DialerProcessResult = new DialerProcessResult();
                        returnObj.itemsErrored = errorLines;
                        returnObj.itemsProcessed = dialerEntries;
                        if (config.testingPhoneNumberOverride && (process.env.environment === config.environments.development.toString() ||
                            process.env.environment === config.environments.qa.toString() ||
                            process.env.environment === config.environments.model.toString())) {
                            logger.debug("Overrode all phoneNumbers with " + config.testingPhoneNumberOverride);
                        }

                        resolve(returnObj);
                        return;
                    }).catch(e => {
                        reject(e);
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}