import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { createWaypoint, WayPoint } from "../data/waypoint";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    };
    try {
        const { sessionId, userId, scooterId, lat, long, expiry } = JSON.parse(event.body);
        const createdAt = new Date().toISOString();
        const wp = new WayPoint(sessionId, userId, scooterId, lat, long, expiry, createdAt);
        await createWaypoint(wp);
        response.body = JSON.stringify({ wp });
    } catch (error) {
        console.log("err: ", error);
        response.statusCode = 502;
        response.body = JSON.stringify(error);
    }

    return response;
};
