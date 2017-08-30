/*! © Copyright IBM Corporation 2010, 2016. */

export interface IIngest {
    Ingest(fileLocation: string): Promise<Object>;
}

export class IngestionClient {
    constructor(private strategy: IIngest) { }
    public Ingest(fileLocation: string): Promise<Object> {
        return this.strategy.Ingest(fileLocation);
    }
}