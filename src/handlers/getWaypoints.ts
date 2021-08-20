import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { getWaypoints } from "../data/waypoint";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const { sessionId } = event.pathParameters;
    const waypoints = await getWaypoints(sessionId);
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            waypoints
        })
    };

    return response;
};
