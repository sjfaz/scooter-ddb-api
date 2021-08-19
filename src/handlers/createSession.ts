import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { startSession } from "../data/user";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    };
    try {
        const { type, sessionId, startTime, userId, expiry, active } = JSON.parse(event.body);
        const sess = { type, sessionId, startTime, expiry, userId, active };
        await startSession(sess, userId);
        response.body = JSON.stringify(sess);
    } catch (error) {
        console.log("err: ", error);
        response.statusCode = 502;
        response.body = JSON.stringify(error);
    }

    return response;
};
