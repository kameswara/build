/*! © Copyright IBM Corporation 2010, 2016. */

export const dialerFolder: string = "//DAL12VWEBS01/Share/DialerFolder";
export const propertiesFolder: string = "//DAL12VWEBS01/Share/PropertiesFolder";
export const errorsFolder: string = "//DAL12VWEBS01/Share/ErrorsFolder";
export const vxmlLocation: string = "http://10.10.246.91/IVR_COMMON/TRAN/VXML";
export const internalAPILocation: string = "http://localhost:9080/api/";

export const defaultTimeZone: string = "America/Chicago"; // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
export const testingPhoneNumberOverride: number = null;

export const mongoSettings: any = {
    dbName: "TransitionDialer?replicaSet=homestead&connectTimeoutMS=300000",
    dbType: "Mongo",
    options: {
        auth: { user: 'transitionuser', password: '859h7ArrQdLs2pN!' }
    },
    port: 27017,
    serverUrl: "172.16.8.86:27017,172.16.8.87",
};

export const environment: number = environments.production;
export const enum environments {
    development = 0,
    qa = 1,
    model = 2,
    production = 3
};
