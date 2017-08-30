
/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../Config";
import { DialerActivityBuilder } from "../controllers/DialerActivityBuilder";
import { DialerActivityController } from "../controllers/DialerActivityController";
import { MockObjects } from "./MockObjects";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { CampaignProperties, Dialer, DialerActivityStatus,
    ICampaignProperties, IDialer, IDialerActivity, IRequest, ISchedule } from "transistiondal";

chai.use(sinonChai);
chai.use(chaiAsPromised);
let expect: any = chai.expect;

describe("dialerActivity.unit.spec", () => {
    describe("DialerActivityController", () => {
        describe("BuildDialerActivity", () => {
            it("BuildDialerActivity_Success", sinon.test(function (done: any): any {
                let getCampaignPropertiesStub: any = this.stub(DialerActivityController, "GetCampaignProperties");
                getCampaignPropertiesStub.returns(Promise.resolve(MockObjects.getPropertiesObject()));

                let buildScheduleStub: any = this.stub(DialerActivityController, "BuildSchedule");
                buildScheduleStub.returns(Promise.resolve(MockObjects.getScheduleObject()));
                let buildRequestStub: any = this.stub(DialerActivityController, "BuildRequest");
                buildRequestStub.returns(Promise.resolve(MockObjects.getRequestObject()));
                let getResultsSpy: any = this.spy(DialerActivityBuilder.prototype, "getResults");

                let result: Promise<IDialerActivity> = DialerActivityController.BuildDialerActivity(
                    MockObjects.getDialerObject(), DialerActivityStatus.New);

                return result.then(val => {
                    val.validate(err => {
                        expect(err).to.be.null;
                    });
                    expect(getCampaignPropertiesStub).to.be.calledOnce;
                    expect(buildScheduleStub).to.be.calledOnce;
                    expect(buildRequestStub).to.be.calledOnce;
                    expect(getResultsSpy).to.be.calledOnce;
                    done();
                });
            }));

            it("NullParameter_Throws", sinon.test(function (): any {
                let result: Promise<IDialerActivity> = DialerActivityController.BuildDialerActivity(null, null);
                return expect(result).to.be.rejectedWith("Cannot build dialer activity. The dialer is null.");
            }));

            it("BubbleUpCampaignPropertiesError_Throws", sinon.test(function (): any {
                let getCampaignPropertiesStub: any = this.stub(DialerActivityController, "GetCampaignProperties");
                getCampaignPropertiesStub.returns(Promise.reject("this is a campaign properties error"));

                let result: Promise<IDialerActivity> = DialerActivityController.BuildDialerActivity(
                    MockObjects.getDialerObject(), DialerActivityStatus.New);

                return expect(result).to.be.rejectedWith("this is a campaign properties error");
            }));
        });

        describe("BuildRequest", () => {
            it("BuildRequest_Success", sinon.test(function (): any {
                let dialer: IDialer = MockObjects.getDialerObject();
                let campaignProperty: ICampaignProperties = MockObjects.getPropertiesObject();
                let schedule: ISchedule = MockObjects.getScheduleObject();
                let result: Promise<IRequest> = DialerActivityController.BuildRequest(dialer, campaignProperty, schedule);

                return result.then(val => {
                    val.validate(err => {
                        expect(err).to.be.null;
                    });
                });
            }));

            it("NullDialerParameter_Throws", sinon.test(function (): any {
                let campaignProperty: ICampaignProperties = MockObjects.getPropertiesObject();
                let schedule: ISchedule = MockObjects.getScheduleObject();
                let result: Promise<IRequest> = DialerActivityController.BuildRequest(null, campaignProperty, schedule);
                return expect(result).to.be.rejectedWith("Cannot build request. The dialer is null.");
            }));

            it("InvalidDialer_Throws", sinon.test(function (): any {
                let dialer: IDialer = MockObjects.getDialerObject();
                dialer.phoneNumber = 123;
                let campaignProperty: ICampaignProperties = MockObjects.getPropertiesObject();
                let schedule: ISchedule = MockObjects.getScheduleObject();

                let result: Promise<IRequest> = DialerActivityController.BuildRequest(dialer, campaignProperty, schedule);
                return expect(result).to.be.rejectedWith(
                    "Cannot build request. ValidationError: Path `outboundNumber` (123) is less than minimum allowed value (1000000000).");
            }));

            it("NullCampaignPropertyParameter_Throws", sinon.test(function (): any {
                let dialer: IDialer = MockObjects.getDialerObject();
                let schedule: ISchedule = MockObjects.getScheduleObject();
                let result: Promise<IRequest> = DialerActivityController.BuildRequest(dialer, null, schedule);
                return expect(result).to.be.rejectedWith("Cannot build request. The campaign Properties are null.");
            }));

            it("InvalidCampaignProperty_Throws", sinon.test(function (): any {
                let dialer: IDialer = MockObjects.getDialerObject();
                let campaignProperty: ICampaignProperties = MockObjects.getPropertiesObject();
                campaignProperty.callerIdPhoneNumber = null;
                let schedule: ISchedule = MockObjects.getScheduleObject();

                let result: Promise<IRequest> = DialerActivityController.BuildRequest(dialer, campaignProperty, schedule);
                return expect(result).to.be.rejectedWith("Cannot build request. ValidationError: callBackNumber is required");
            }));

            it("NullScheduleParameter_Throws", sinon.test(function (): any {
                let dialer: IDialer = MockObjects.getDialerObject();
                let campaignProperty: ICampaignProperties = MockObjects.getPropertiesObject();
                let result: Promise<IRequest> = DialerActivityController.BuildRequest(dialer, campaignProperty, null);
                return expect(result).to.be.rejectedWith("Cannot build request. The schedule is null.");
            }));
        });
    });
});