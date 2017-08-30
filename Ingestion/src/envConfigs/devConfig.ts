/*! © Copyright IBM Corporation 2010, 2016. */

export const dialerFolder: string = "//MDL12WEBDEV01/Share/DialerFolder";
export const propertiesFolder: string = "//MDL12WEBDEV01/Share/PropertiesFolder";
export const errorsFolder: string = "//MDL12WEBDEV01/Share/ErrorsFolder";
export const vxmlLocation: string = "http://192.168.248.48/ibm";
export const internalAPILocation: string = "http://localhost:9080/api/";

export const defaultTimeZone: string = "America/Chicago"; // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
export const testingPhoneNumberOverride: number = null;

export const mongoSettings: any ={
    dbName: "Transition",
    dbType: "Mongo",
    serverUrl: "127.0.0.1", // PhytelServiceManager API url
    port: 88, // PhytelServiceManager API port    
};

export const environment: number = environments.development;
export const enum environments {
    development = 0,
    qa = 1,
    model = 2,
    production = 3
};
