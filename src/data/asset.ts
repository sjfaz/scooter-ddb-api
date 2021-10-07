import { DynamoDB, IoTJobsDataPlane } from "aws-sdk";
import { Item } from "./base";
import { getClient } from "./client";
import { Coords } from "./constants";

export class Asset extends Item {
    assetId: string;
    type: string;
    lat?: string;
    long?: string;
    coordinates?: Coords;
    batteryLevel?: string;
    bayId?: string;
    version?: number;
    inventory?: number;

    constructor(
        assetId: string,
        type: string,
        lat?: string,
        long?: string,
        coords?: Coords,
        batteryLevel?: string,
        bayId?: string,
        version?: number,
        inventory?: number
    ) {
        super();
        this.assetId = assetId;
        this.type = type ?? undefined;
        this.lat = lat ?? undefined;
        this.long = long ?? undefined;
        this.coordinates = coords ?? undefined;
        this.batteryLevel = batteryLevel ?? undefined;
        this.bayId = bayId ?? undefined;
        this.version = version ?? undefined;
        this.inventory = inventory ?? undefined;
    }

    static fromItem(item?: DynamoDB.AttributeMap): Asset {
        if (!item) throw new Error("No item!");
        switch (item.Type.S) {
            case "Scooter":
                return new Asset(
                    item.AssetId.S,
                    item.Type.S,
                    item.Lat.S,
                    item.Long.S,
                    null,
                    item.BatteryLevel.S,
                    item.BayId.S,
                    Number(item.Version.N),
                    Number(item.Inventory.N)
                );
            case "Bay":
                return new Asset(
                    item.AssetId.S,
                    item.Type.S,
                    null,
                    null,
                    this.fromCoords(item.Coordinates.M)
                );
        }
    }

    get pk(): string {
        return this.assetId;
    }

    get sk(): string {
        return this.assetId;
    }

    toItem(): Record<string, unknown> {
        console.log("to item");
        const item = {
            ...this.keys(),
            Type: { S: this.type },
            AssetId: { S: this.assetId }
        };
        switch (this.type) {
            case "Scooter":
                return {
                    ...item,
                    Lat: { S: this.lat },
                    Long: { S: this.long },
                    BatteryLevel: { S: this.batteryLevel },
                    BayId: { S: this.bayId },
                    Version: { N: this.version },
                    Inventory: { N: this.inventory }
                };
            case "Bay":
                return { ...item, Coordinates: { M: this.toCoords(this.coordinates) } };
        }
    }

    toCoords(coords: any) {
        return DynamoDB.Converter.marshall(coords);
    }

    static fromCoords(coords: any): Coords {
        return DynamoDB.Converter.unmarshall(coords) as Coords;
    }
}

export const getAssets = async (): Promise<Asset[]> => {
    const client = getClient();
    try {
        const resp = await client
            .scan({
                TableName: process.env.TABLE_NAME,
                IndexName: "Assets"
            })
            .promise();
        console.log("resp:", resp);
        return resp.Items.map((item) => Asset.fromItem(item));
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createAsset = async (asset: Asset): Promise<Asset> => {
    const client = getClient();

    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: { ...asset.toItem(), CreatedAt: { N: `${Date.now()}` } },
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise();
        return asset;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
