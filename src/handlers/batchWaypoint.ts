import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { batchCreateWaypoints } from "../data/waypoint";

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    };
    try {
        const bwp = JSON.parse(event.body);
        await batchCreateWaypoints(bwp);
        response.body = JSON.stringify({ bwp });
    } catch (error) {
        console.log("err: ", error);
        response.statusCode = 502;
        response.body = JSON.stringify(error);
    }

    return response;
};
