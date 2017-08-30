/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../Config";
import { DialerActivityController } from "../controllers/DialerActivityController";
import { Ingestion } from "../controllers/IngestionController";
import { IngestDialer } from "../controllers/IngestionStrategy/IngestDialer";
import { DialerProcessResult, IDialerProcessResult } from "../models/IDialerProcessResult";
import { MockObjects } from "./MockObjects";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { CampaignProperties, Dialer, ICampaignProperties, IDialer} from "transistiondal";

chai.use(sinonChai);
chai.use(chaiAsPromised);
let expect: any = chai.expect;

describe("ingestion.unit.spec", () => {
    describe("IngestionController", () => {
        let ingestion: Ingestion;

        beforeEach(() => {
            ingestion = new Ingestion();
        });

        describe("ReadDialer", () => {
            it("ReadDialerFile_Success", sinon.test(function (): any {
                let dialerMongo: any = Dialer.getModel(config.mongoSettings);
                let validateDialerStub: any = this.stub(IngestDialer, "_validateDialer")
                .returns(true);
                let fsReadfileStub: any = this.stub(fs, "readFile")
                .yields(null, MockObjects.getDialerRawData());

                let result: Promise<IDialerProcessResult> = ingestion.ReadDialer("Dummy File");

                return result.then(value => {
                    expect(value.constructor.name).to.be.eql("DialerProcessResult");
                    expect(value.itemsProcessed.length).to.be.equals(4);

                    expect(fsReadfileStub).to.have.been.calledOnce;
                    expect(fsReadfileStub).to.have.been.calledWith("Dummy File", "utf-8", sinon.match.any);
                    expect(validateDialerStub).to.have.been.callCount(4);
                    let dialers: Array<IDialer> = [MockObjects.getDialerObject(), MockObjects.getDialerObject(),
                        MockObjects.getDialerObject(), MockObjects.getDialerObject()];

                    let readDialers: Array<IDialer> = value.itemsProcessed; // as Array<IDialer>;
                    expect(readDialers.toString()).to.eql(dialers.toString());
                    readDialers.forEach(element => {
                        element.validate(valErr => {
                            expect(valErr).to.be.null;
                        });
                    });
                });
            }));

            it("NullParameters_Throws", sinon.test(function (): any {
                let result: Promise<IDialerProcessResult> = ingestion.ReadDialer(null);
                return expect(result).to.be.rejectedWith("TypeError: path must be a string or Buffer");
            }));

            it("ValidateDialerModelWithBadParams_Throws", sinon.test(function (done: any): any {
                let dialerMongo: any = Dialer.getModel(config.mongoSettings);
                let mockDialer: IDialer = new dialerMongo();

                mockDialer.validate(err => {
                    expect(err.errors.vendorLeadCode.message).to.eql("vendorLeadCode is required");
                    expect(err.errors.callBatchID.message).to.eql("callBatchID is required");
                    expect(err.errors.phoneCountryCode.message).to.eql("phoneCountryCode is required");
                    expect(err.errors.phoneNumber.message).to.eql("phoneNumber is required");
                    expect(err.errors.firstName.message).to.eql("firstName is required");
                    expect(err.errors.lastName.message).to.eql("lastName is required");
                    expect(err.errors.timeZone.message).to.eql("timeZone is required");
                    expect(err.errors.dialerMediaID.message).to.eql("dialerMediaID is required");
                    expect(err.errors.dialerCampaignID.message).to.eql("dialerCampaignID is required");
                    expect(err.errors.dialerContractID.message).to.eql("dialerContractID is required");

                    done();
                });
            }));

            it("ValidateDialerModel_Success", sinon.test(function (done: any): any {
                let mockDialer: IDialer = MockObjects.getDialerObject();
                mockDialer.validate(err => {
                    expect(err).to.be.null;
                    done();
                });
            }));

            it("MalformedDialerFile_Should_Return_Errors", sinon.test(function (done: any): any {
                let fsReadfileStub: any = this.stub(fs, "readFile");
                fsReadfileStub.yields(null, "||||||||");

                let result: Promise<IDialerProcessResult> = ingestion.ReadDialer("Dummy File");

                return result.then(obj => {
                    expect(obj.constructor.name).to.be.eql("DialerProcessResult");
                    expect(obj.itemsErrored.length).to.be.eql(1);
                    // expect(obj.itemsErrored[1]).to.equals("||||||||");
                    done();
                });
            }));
        });

        describe("DialerComplete", () => {
            it("DialerComplete_Success", sinon.test(function (done: any): any {
                let fsExistsSyncSpy: any = this.spy(fs, "existsSync");
                let fsMkdirSync: any = this.stub(fs, "mkdirSync");
                let fsRenameStub: any = this.stub(fs, "rename");
                fsRenameStub.yields(null);
                let fsStatStub: any = this.stub(fs, "stat");
                fsStatStub.yields(null, { isFile: () => { return true; } });

                let result: Promise<boolean> = ingestion.DialerComplete("Dummy File");

                return result.then(value => {
                    expect(fsStatStub).to.be.calledOnce;
                    expect(fsExistsSyncSpy).to.be.calledOnce;
                    expect(fsMkdirSync).to.be.calledOnce;
                    expect(fsRenameStub).to.be.calledOnce;
                    expect(value).to.be.true;

                    done();
                });
            }));

            it("NullParameter_Throws", sinon.test(function (): any {
                let result: Promise<boolean> = ingestion.DialerComplete(null);
                return expect(result).to.be.rejectedWith("TypeError: path must be a string or Buffer");
            }));
        });

        describe("ReadProperties", () => {
            it("ReadPropertiesFile_Success", sinon.test(function (): any {
                let campaignPropertiesMongo: any = CampaignProperties.getModel(config.mongoSettings);
                let validateSpy: any = this.spy(campaignPropertiesMongo.prototype, "validate");
                let fsReadfileStub: any = this.stub(fs, "readFile");
                fsReadfileStub.yields(null, MockObjects.getPropertiesRawData());

                let result: Promise<ICampaignProperties> = ingestion.ReadProperties("Dummy File");

                return result.then(value => {
                    expect(fsReadfileStub).to.have.been.calledOnce;
                    expect(fsReadfileStub).to.have.been.calledWith("Dummy File", "utf-8", sinon.match.any);
                    expect(validateSpy).to.have.been.calledOnce;
                    value.validate(valErr => {
                        expect(valErr).to.be.null;
                    });

                    let properties: ICampaignProperties = MockObjects.getPropertiesObject();
                    let model: ICampaignProperties = value;
                    properties._id = null;
                    model._id = null;
                    expect(model.toJSON()).to.eql(properties.toJSON());
                });
            }));

            it("NullFile_Throws", sinon.test(function (): any {
                let result: Promise<ICampaignProperties> = ingestion.ReadProperties(null);
                return expect(result).to.be.rejectedWith("TypeError: path must be a string or Buffer");
            }));

            it("ValidateCampaignPropertiesModelWithBadParams_Throws", sinon.test(function (done: any): any {
                let campaignPropertiesMongo: any = CampaignProperties.getModel(config.mongoSettings);
                let mockProperties: ICampaignProperties = new campaignPropertiesMongo();

                mockProperties.validate(err => {
                    expect(err.errors.campaignName.message).to.eql("campaignName is required");
                    expect(err.errors.callerIdPhoneNumber.message).to.eql("callerIdPhoneNumber is required");
                    expect(err.errors.numberOfCallAttempts.message).to.eql("numberOfCallAttempts is required");
                    expect(err.errors.callWindows.message).to.eql("callWindows is required");

                    done();
                });
            }));

            it("ValidateCampaignPropertiesModel_Success", sinon.test(function (done: any): any {
                let mockProperties: ICampaignProperties = MockObjects.getPropertiesObject();

                mockProperties.validate(err => {
                    expect(err).to.be.null;

                    done();
                });
            }));
        });

        describe("PropertiesComplete", () => {
            it("PropertiesComplete_Success", sinon.test(function (done: any): any {
                let fsUnlinkStub: any = this.stub(fs, "unlink");
                fsUnlinkStub.yields(null);

                let result: Promise<boolean> = ingestion.PropertiesComplete("Dummy File");

                return result.then(value => {
                    expect(value).to.be.true;
                    expect(fsUnlinkStub).to.be.calledOnce;
                    expect(fsUnlinkStub).to.be.calledWith("Dummy File", sinon.match.any);

                    done();
                });
            }));

            it("NullParameters_Throws", sinon.test(function (): any {
                let result: Promise<boolean> = ingestion.PropertiesComplete(null);
                return expect(result).to.be.rejectedWith("TypeError: path must be a string or Buffer");
            }));
        });
    });
});