/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "./Config";
import { DialerActivityController } from "./controllers/DialerActivityController";
import { Ingestion } from "./controllers/IngestionController";
import { IDialerProcessResult } from "./models/IDialerProcessResult";
import { watch } from "chokidar";
import * as fs from "fs";
import * as cache  from "memory-cache";
import { Model } from "mongoose";
import * as filePath from "path";
import { CampaignPropertiesRepository, DialerActivity,
    ICampaignProperties, IDialer, IDialerActivity} from "transistiondal";
import { logger } from "watsonhealthutils";

process.env.environment = config.environment;
let ingestion: Ingestion = new Ingestion();

watch(config.dialerFolder, {
    awaitWriteFinish: { pollInterval: 100, stabilityThreshold: 2000 },
    ignored: /processed/,
}).on("add", async (path, event) => {
    try {
        logger.info("Started processing dialer: " + path);
        let dialerResult: IDialerProcessResult = await ingestion.ReadDialer(path);
        if (dialerResult) {
            if (dialerResult.itemsProcessed !== null && dialerResult.itemsProcessed.length > 0) {
                await ingestion.hydrateCache(dialerResult.itemsProcessed);
                await ingestion.processAndSaveDialer(dialerResult.itemsProcessed as Array<IDialer>);
            }
            if (dialerResult.itemsErrored !== null && dialerResult.itemsErrored.length > 0) {
                await ingestion.CreateErrorFile(path, dialerResult.itemsErrored as string[]);
            }
            await ingestion.DialerComplete(path);
            logger.info("Dialer file processed: " + path);
            return;
        }
    } catch (err) {
        logger.error(err);
        return;
    }
});

watch(config.propertiesFolder, {
    awaitWriteFinish: { pollInterval: 100, stabilityThreshold: 2000 },
    ignored: /[\/\\]\./,
}).on("add", async (path, event) => {
    try {
        let fileInfo: Object = filePath.parse(path);
        // tslint:disable-next-line:no-string-literal
        if (fileInfo["name"] === "clear_cache") {
            cache.clear();
            logger.info("Cache has been cleared: " + new Date().toString());
            fs.unlinkSync(path);
            return;
        }
        logger.info("Started processing properties file: " + path);
        let prop: ICampaignProperties = await ingestion.ReadProperties(path);
        let campaignPropertiesRepo: CampaignPropertiesRepository = new CampaignPropertiesRepository(config.mongoSettings);
        await campaignPropertiesRepo.findOneAndUpdate({ campaignName: prop.campaignName }, prop, { new: true, upsert: true });
        logger.info("Saved properties file to the database for: " + prop.campaignName);
        await ingestion.PropertiesComplete(path);
        logger.info("Properties file processed: " + path);
        return;
    } catch (e) {
        logger.error(e);
        return;
    }
});