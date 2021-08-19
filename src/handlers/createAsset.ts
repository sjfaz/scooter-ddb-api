import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Asset, createAsset } from "../data/asset"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    }
    try {
        const { assetId, type, lat, long, coordinates, batteryLevel, bayId } = JSON.parse(event.body)
        const asset = new Asset(assetId, type, lat, long, coordinates, batteryLevel, bayId)
        await createAsset(asset)
        response.body = JSON.stringify({ asset })
    } catch (error) {
        console.log("err: ", error)
        response.statusCode = 502
        response.body = JSON.stringify(error)
    }

    return response
}
