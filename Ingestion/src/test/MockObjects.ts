/*! © Copyright IBM Corporation 2010, 2016. */

import * as config from "../Config";
import { CallWindow, CampaignProperties, DayOfWeek, Dialer, ICampaignProperties, IDialer, IRequest,
    ISchedule, MessageType, Request, Schedule, ScheduleType} from "transistiondal";

export class MockObjects {
    public static getDialerObject(): IDialer {
        let dialerMongo: any = Dialer.getModel(config.mongoSettings);
        let d: IDialer = new dialerMongo();
        d.vendorLeadCode = "98797";
        d.callBatchID = "1";
        d.phoneCountryCode = 1;
        d.phoneNumber = 4696319674;
        d.firstName = "testtesttesttesttest";
        d.lastName = "StacyN";
        d.timeZone = "America/Chicago";
        d.dialerMediaID = "VOXEOMONITOR";
        d.dialerCampaignID = "TESTCAMPNAME";
        d.dialerContractID = "VOXEOMONITOR";
        return d;
    }

    public static getDialerRawData(): string {
        /* tslint:disable:max-line-length */
        return `98797||1|1|4696319674||testtesttesttesttest||StacyN|||||||||||||||||Central Standard Time|2145551212|VOXEOMONITOR|TESTCAMPNAME|VOXEOMONITOR
98797||1|1|4696319674||testtesttesttesttest||StacyN|||||||||||||||||Central Standard Time|2145551212|VOXEOMONITOR|TESTCAMPNAME|VOXEOMONITOR
98797||1|1|4696319674||testtesttesttesttest||StacyN|||||||||||||||||Central Standard Time|2145551212|VOXEOMONITOR|TESTCAMPNAME|VOXEOMONITOR
98797||1|1|4696319674||testtesttesttesttest||StacyN|||||||||||||||||Central Standard Time|2145551212|VOXEOMONITOR|TESTCAMPNAME|VOXEOMONITOR`;
        /* tsslint:enable:max-line-length */
    }

    public static getPropertiesObject(): ICampaignProperties {
        let campaignPropertiesMongo: any = CampaignProperties.getModel(config.mongoSettings);
        let p: ICampaignProperties = new campaignPropertiesMongo();
        p.campaignName = "TESTCAMPNAME";
        p.executionId = null;
        p.callerIdPhoneNumber = 17575956363;
        p.numberOfCallAttempts = 3;
        p.callWindows = MockObjects.getCallWindowsObject();
        p.hospitalName = "Test One";
        p.recordingFrequency = 100;
        p.holidays = MockObjects.getHollidaysObject();
        p.scheduleType = ScheduleType.random;
        return p;
    }

    public static getPropertiesRawData(): string {
        return `# This is a properties file for campaign configuration.  \r\n#
        # It will be read as a Java properties file, and is case-sensitive.
        #
        #Required fields
        campaign_name=TESTCAMPNAME
        caller_id_phone_number=17575956363
        number_of_call_attempts=3
        #Call Windows.  Day 1 is Sunday.  Time is 24-hour HHMM.  Omitted days and windows are skipped.

        day.2.window.1.start=1000
        day.2.window.1.end=1600
        day.2.window.2.start=1700
        day.2.window.2.end=2000
        day.3.window.1.start=1000
        day.3.window.1.end=1600
        day.3.window.2.start=1700
        day.3.window.2.end=2000
        day.4.window.1.start=1000
        day.4.window.1.end=1600
        day.4.window.2.start=1700
        day.4.window.2.end=2000
        day.5.window.1.start=1000
        day.5.window.1.end=1600
        day.5.window.2.start=1700
        day.5.window.2.end=2000
        day.6.window.1.start=1000
        day.6.window.1.end=1600
        day.6.window.2.start=1700
        day.6.window.2.end=2000

        #Optional fields
        hospital_name=Test One
        #recording frequency 0-100%
        recording_frequency=100
        #comma-delimited list of dates not to make calls, YYYY-MM-DD format.
        holidays=2016-03-25\,2016-05-30\,2016-07-04\,2016-09-05\,2016-11-24\,2016-12-24\,2016-12-25\,2016-12-31\,2017-01-01
        #schedule.type
        # * random means random in the window.
        # * asap means at the window start
        schedule.type=random`;
    }

    public static getCallWindowsObject(): Array<CallWindow> {
        let cws: Array<CallWindow> = new Array<CallWindow>();

        let cw: CallWindow = new CallWindow();
        cw.windowNumber = 1;
        cw.windowDayOfWeek = DayOfWeek.Monday;
        cw.windowStartTime = new Date("1970-01-01T10:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T16:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 2;
        cw.windowDayOfWeek = DayOfWeek.Monday;
        cw.windowStartTime = new Date("1970-01-01T17:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T20:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 1;
        cw.windowDayOfWeek = DayOfWeek.Tuesday;
        cw.windowStartTime = new Date("1970-01-01T10:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T16:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 2;
        cw.windowDayOfWeek = DayOfWeek.Tuesday;
        cw.windowStartTime = new Date("1970-01-01T17:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T20:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 1;
        cw.windowDayOfWeek = DayOfWeek.Wednesday;
        cw.windowStartTime = new Date("1970-01-01T10:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T16:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 2;
        cw.windowDayOfWeek = DayOfWeek.Wednesday;
        cw.windowStartTime = new Date("1970-01-01T17:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T20:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 1;
        cw.windowDayOfWeek = DayOfWeek.Thursday;
        cw.windowStartTime = new Date("1970-01-01T10:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T16:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 2;
        cw.windowDayOfWeek = DayOfWeek.Thursday;
        cw.windowStartTime = new Date("1970-01-01T17:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T20:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 1;
        cw.windowDayOfWeek = DayOfWeek.Friday;
        cw.windowStartTime = new Date("1970-01-01T10:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T16:00:00.000Z");
        cws.push(cw);

        cw = new CallWindow();
        cw.windowNumber = 2;
        cw.windowDayOfWeek = DayOfWeek.Friday;
        cw.windowStartTime = new Date("1970-01-01T17:00:00.000Z");
        cw.windowEndTime = new Date("1970-01-01T20:00:00.000Z");
        cws.push(cw);

        return cws;
    }

    public static getHollidaysObject(): Array<Date> {
        let holidays: Array<Date> =
            [
                new Date("2016-03-25T00:00:00.000Z"),
                new Date("2016-05-30T00:00:00.000Z"),
                new Date("2016-07-04T00:00:00.000Z"),
                new Date("2016-09-05T00:00:00.000Z"),
                new Date("2016-11-24T00:00:00.000Z"),
                new Date("2016-12-24T00:00:00.000Z"),
                new Date("2016-12-25T00:00:00.000Z"),
                new Date("2016-12-31T00:00:00.000Z"),
                new Date("2017-01-01T00:00:00.000Z"),
            ];
        return holidays;
    }

    public static getScheduleObject(): ISchedule {
        let scheduleMongo: any = Schedule.getModel(config.mongoSettings);
        let sch: ISchedule = new scheduleMongo();
        sch.attemptNumber = 1;
        sch.recordingFrequency = 100;
        sch.scheduleType = ScheduleType.random;
        sch.windowDayOfWeek = DayOfWeek.Wednesday;
        sch.windowStartTime = new Date("1969-12-31T17:00:00.000Z");
        sch.windowEndTime = new Date("1969-12-31T20:00:00.000Z");
        return sch;
    }

    public static getRequestObject(): IRequest {
        let requestMongo: any = Request.getModel(config.mongoSettings);
        let req: IRequest = new requestMongo();
        req.callBackNumber = MockObjects.getDialerObject().phoneNumber;

        req.callReferenceId = "4b739e38-f2c2-4d97-90c3-af45c08845c5";
        req.outboundNumber = MockObjects.getDialerObject().phoneNumber;
        req.notificationType = 1;
        req.callBackNumber = MockObjects.getPropertiesObject().callerIdPhoneNumber;
        req.messageType = MessageType.VXML;
        req.message = "C:\test\path";
        req.startSchedule = MockObjects.getScheduleObject().windowStartTime;
        req.endSchedule = MockObjects.getScheduleObject().windowEndTime;

        return req;
    }
}