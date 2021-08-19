import { DynamoDB } from "aws-sdk";
import { Item } from "./base";
import { getClient } from "./client";
import { Session, USER_TYPE, SESSION_TYPE } from "./constants";
const { unmarshall, marshall } = DynamoDB.Converter;

export class User extends Item {
    email: string;
    name: string;
    sessions?: Session[];

    constructor(email: string, name: string, sessions?: Session[]) {
        super();
        this.email = email;
        this.name = name;
        this.sessions = sessions;
    }

    static fromItems(items?: DynamoDB.AttributeMap[]): User {
        if (!items) throw new Error("No item!");
        const item = items.filter((i) => i.SK.S.startsWith(USER_TYPE));
        const sessions = items.filter((i) => i.SK.S.startsWith(SESSION_TYPE));
        if (!item[0]) throw new Error("No item!");
        return new User(item[0].Email.S, item[0].Name.S, this.fromSession(sessions));
    }

    static fromSession(data: any[]): Session[] {
        return data.map((d) => {
            const plain = unmarshall(d);
            const sess = {
                sessionId: plain.SK,
                type: plain.Type,
                startTime: plain.StartTime,
                endTime: plain.EndTime,
                expiry: plain.Expiry,
                userId: plain.PK
            };
            if (plain.active === true) {
                sess["active"] = true;
            }
            return sess;
        });
    }

    get pk(): string {
        return `${USER_TYPE}${this.email}`;
    }

    get sk(): string {
        return `${USER_TYPE}${this.email}`;
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            Email: { S: this.email },
            Name: { S: this.name },
            Type: { S: "User" }
        };
    }
}

export const startSession = async (session: Session, userId: string): Promise<Session> => {
    const client = getClient();
    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: marshall({
                    PK: userId,
                    SK: session.sessionId,
                    Type: "Session",
                    UserId: userId,
                    Expiry: session.expiry,
                    StartTime: session.startTime,
                    CreatedAt: Date.now(),
                    Active: session.active ?? undefined
                }),
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise();
        return session;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const endSession = async (sessionId: string, endTime: string, userId: string) => {
    const client = getClient();
    try {
        await client
            .updateItem({
                TableName: process.env.TABLE_NAME,
                Key: {
                    PK: {
                        S: userId
                    },
                    SK: {
                        S: sessionId
                    }
                },
                UpdateExpression: "SET EndTime = :val1 REMOVE Active",
                ExpressionAttributeValues: {
                    ":val1": { S: endTime }
                }
            })
            .promise();
        return {};
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createUser = async (user: User): Promise<User> => {
    const client = getClient();

    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: { ...user.toItem(), CreatedAt: { N: `${Date.now()}` } },
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise();
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getUser = async (email: string): Promise<User> => {
    const client = getClient();

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": { S: `${USER_TYPE}${email}` }
                }
            })
            .promise();
        return User.fromItems(resp.Items);
    } catch (error) {
        console.log(error);
        throw error;
    }
};
