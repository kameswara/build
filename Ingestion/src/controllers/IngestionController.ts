/*! © Copyright IBM Corporation 2010, 2016. */
import * as config from "../Config";
import { DialerActivityController } from "../controllers/DialerActivityController";
import { IDialerProcessResult  } from "../models/IDialerProcessResult";
import { IngestDialer } from "./IngestionStrategy/IngestDialer";
import { IngestionClient } from "./IngestionStrategy/IngestionStrategy";
import { IngestProperties } from "./IngestionStrategy/IngestProperties";
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { CallWindow, Dialer, DialerActivityRepository, DialerActivityStatus, ICampaignProperties, IDialer, IDialerActivity } from "transistiondal";
import { logger } from "watsonhealthutils";

export class Ingestion {
    private dialerActivityRepo: DialerActivityRepository;

    constructor() {
        this.dialerActivityRepo = new DialerActivityRepository(config.mongoSettings);
    }

    public CreateErrorFile(file: string, errorLines: string[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                if (!errorLines || errorLines.length === 0) {
                    resolve(true);
                    return;
                }

                let fileName: string = path.basename(file);
                let destDir: string = config.errorsFolder;
                let errorFileName: string = destDir + "/err." + fileName;
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir);
                }
                let errFile: fs.WriteStream = fs.createWriteStream(errorFileName);
                errFile.on("error", error => {
                    reject(error);
                    return;
                });
                errFile.write(errorLines.join(" \r\n"));
                logger.debug("Wrote " + errorLines.length + " bad dialer lines to the error file " + errorFileName);
                errFile.end();
                resolve(true);
                return;
            } catch (e) {
                reject(e);
            }
        });
    }
    public processAndSaveDialer(dialersArray: Array<IDialer>): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                if (!dialersArray) {
                    reject("Reading Dialer File error. No Dialer entries found.");
                    return;
                }

                let splitDialers: Array<Array<IDialer>> = _.chunk(dialersArray, 150);
                let prunedSplitDialers: Array<Array<IDialer>> = await Promise.all<Array<IDialer>>(splitDialers.map(dialerChunk => {
                    return DialerActivityController.pruneDNC(dialerChunk);
                }));
                let prunedDialersArray: Array<IDialer> = [].concat.apply([], prunedSplitDialers);

                let dncDialerArray: Array<IDialer> = new Array<IDialer>();
                let allPasedDialers: any = JSON.parse(JSON.stringify(dialersArray));

                if (allPasedDialers.length > prunedDialersArray.length) {
                    dncDialerArray = _.differenceWith(allPasedDialers, prunedDialersArray, _.isEqual);
                }

                let dncDialerActivities: Array<IDialerActivity> = await Promise.all<IDialerActivity>(dncDialerArray.map(async (da) => {
                    try {
                        return await DialerActivityController.BuildDialerActivity(da, DialerActivityStatus.DoNotCall);
                    } catch (e) {
                        logger.error(e + " | " + JSON.stringify(da));
                        return null;
                    }
                }));
                let goodDialerActivities: Array<IDialerActivity> = await Promise.all<IDialerActivity>(prunedDialersArray.map(async (da) => {
                    try {
                        return await DialerActivityController.BuildDialerActivity(da, DialerActivityStatus.New);
                    } catch (e) {
                        logger.error(e + " | " + JSON.stringify(da));
                        return null;
                    }
                }));

                let allDialerActivities: Array<IDialerActivity> = _.concat<IDialerActivity>(
                    _.compact<IDialerActivity>(dncDialerActivities), _.compact<IDialerActivity>(goodDialerActivities));

                return resolve(await Promise.all(allDialerActivities.map(da => {
                    return this.saveDialerActivity(da, this.dialerActivityRepo);
                })));
            } catch (error) {
                logger.error(error);
                return reject(error);
            }

        });
    }

    public hydrateCache(dialersArray: Array<IDialer>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let campaigns: Array<string> = dialersArray.map(d => { return d.dialerCampaignID; });
                campaigns = _.uniq(campaigns);
                let campaignProperties: any = await Promise.all(campaigns.map(c => { return DialerActivityController.GetCampaignProperties(c); }));

                let tzs: Array<string> = dialersArray.map(d => { return d.timeZone; });
                tzs = _.uniq(tzs);
                for (let cp of campaignProperties) {
                    for (let tz of tzs) {
                        await DialerActivityController.BuildSchedule(cp, tz);
                    }
                }
                resolve();
            } catch (e) {
                logger.error(e);
                resolve();
            }
        });
    }

    public saveDialerActivity(dialerActivity: IDialerActivity, dialerActivityRepo: DialerActivityRepository): Promise<IDialerActivity> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("Saved dialerActivity to the database for: " + dialerActivity.dialer.firstName +
                    " " + dialerActivity.dialer.lastName + " (" + dialerActivity.dialer.phoneNumber + ") '" + dialerActivity.status + "'");
                resolve(await dialerActivityRepo.save(dialerActivity));
            } catch (valErr) {
                reject(valErr);
                return;
            }
        });
    }

    public ReadDialer(fileLocation: string): Promise<IDialerProcessResult> {
        let ic: IngestionClient = new IngestionClient(new IngestDialer());
        return ic.Ingest(fileLocation);
    }

    public DialerComplete(file: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                fs.stat(file, function (err: any, fileStat: fs.Stats): void {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (fileStat.isFile()) {
                        let fileName: string = path.basename(file);
                        let sourceDir: string = path.dirname(file);
                        let destDir: string = sourceDir + "/processed";

                        if (!fs.existsSync(destDir)) {
                            fs.mkdirSync(destDir);
                        }

                        fs.rename(file, destDir + "/" + fileName, function (renameErr: NodeJS.ErrnoException): void {
                            if (renameErr) {
                                reject(renameErr);
                                return;
                            } else {
                                resolve(true);
                                return;
                            }
                        });
                    } else {
                        reject("Dialer file must be a file. " + file);
                        return;
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    public ReadProperties(fileLocation: string): Promise<ICampaignProperties> {
        let ic: IngestionClient = new IngestionClient(new IngestProperties());
        return ic.Ingest(fileLocation);
    }

    public PropertiesComplete(dir: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                fs.unlink(dir, function (err: NodeJS.ErrnoException): void {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve(true);
                        return;
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}