import { APIGatewayProxyHandler } from "aws-lambda";
import { getAssets } from "../data/asset";

export const main: APIGatewayProxyHandler = async () => {
    const assets = await getAssets();
    const response = {
        statusCode: 200,
        body: JSON.stringify(assets)
    };

    return response;
};
