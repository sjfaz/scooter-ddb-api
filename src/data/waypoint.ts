import { DynamoDB } from "aws-sdk";
import { Item } from "./base";
import { getClient } from "./client";
import { SESSION_TYPE, WAYPOINT_TYPE } from "./constants";
const { unmarshall, marshall } = DynamoDB.Converter;

export class WayPoint extends Item {
    constructor(
        private sessionId: string,
        private userId: string,
        private scooterId: string,
        private lat: string,
        private long: string,
        private expiry: number,
        private createdAt: string
    ) {
        super();
    }

    get pk(): string {
        return this.sessionId;
    }

    get sk(): string {
        return `${WAYPOINT_TYPE}${this.createdAt}`;
    }

    static fromItems(items: DynamoDB.AttributeMap[]) {
        return items.map((item) => {
            const { SessionId, UserId, ScooterId, Lat, Long, Expiry, CreatedAt } = unmarshall(item);
            return new WayPoint(SessionId, UserId, ScooterId, Lat, Long, Expiry, CreatedAt);
        });
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            ...marshall({
                Type: "Journey Way Point",
                SessionId: this.sessionId,
                UserId: this.userId,
                ScooterId: this.scooterId,
                Lat: this.lat,
                Long: this.long,
                Expiry: this.expiry,
                CreatedAt: this.createdAt
            })
        };
    }
}

export const getWaypoints = async (partSessionId: string): Promise<WayPoint[]> => {
    const client = getClient();

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": { S: `${SESSION_TYPE}${partSessionId}` }
                }
            })
            .promise();
        return WayPoint.fromItems(resp.Items);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createWaypoint = async (waypoint: WayPoint): Promise<WayPoint> => {
    const client = getClient();

    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: { ...waypoint.toItem() },
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise();
        return waypoint;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
