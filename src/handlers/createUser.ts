import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { User, createUser } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
    const response = {
        statusCode: 200,
        body: ""
    }
    try {
        const { email, name } = JSON.parse(event.body)
        const user = new User(email, name)
        await createUser(user)
        response.body = JSON.stringify({ user })
    } catch (error) {
        console.log("err: ", error)
        response.statusCode = 502
        response.body = JSON.stringify(error)
    }

    return response
}
