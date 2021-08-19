import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { endSession } from "../data/user";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    };
    try {
        const { sessionId, endTime, userId } = JSON.parse(event.body);
        await endSession(sessionId, endTime, userId);
        response.body = JSON.stringify({ sessionId, endTime, userId });
    } catch (error) {
        console.log("err: ", error);
        response.statusCode = 502;
        response.body = JSON.stringify(error);
    }

    return response;
};
