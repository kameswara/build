// /*! © Copyright IBM Corporation 2010, 2016. */
import * as config from "../Config";
import {Ingestion} from "../controllers/IngestionController";
import { IDialerProcessResult } from "../models/IDialerProcessResult";
import {expect} from "chai";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {IDialer} from "TransistionDal";

describe("ingestion.e2e.spec", () => {
    describe("Invalid Dialer Files", () => {
        let ingestion: Ingestion;
        const corruptDialerFile: string = "./src/test/TestFiles/DialerFile_Corrupt.txt";

        beforeEach(() => {
            ingestion = new Ingestion();
        });
        describe("CreateErrorFile", () => {
            it("createErrorFile_two", async () => {
                let errorLines: string[] = [];
                errorLines.push("this is the error1");
                errorLines.push("this is the error2");
                errorLines.push("this is the error3");
                let result: boolean = await ingestion.CreateErrorFile(corruptDialerFile, errorLines);
                expect(result).to.be.true;
            });
        });

        // describe("ReadCorruptFiles", () => {
        //     it("ReadCorruptFile_withoutErrors", async () => {
        //         let result: IDialerProcessResult = await ingestion.ReadDialer(corruptDialerFile);
        //        // expect(result.itemsErrored).to.be.greaterThan(1);
        //         expect(result.itemsProcessed.length).to.be.greaterThan(0);
        //         expect(result.itemsErrored.length).to.be.greaterThan(0);

        //         await ingestion.CreateErrorFile(corruptDialerFile, result[1] as string[]);

        //         // return expect(result).to.be.rejectedWith("ERROR: CampaignProperties validation failed");
        //         // return result.then(value => {
        //         //     expect(value.length).to.be.greaterThan(0, "One or More lines are valid.");
        //         // });
        //     });
        // });

    });
});
