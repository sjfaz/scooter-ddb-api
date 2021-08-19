export interface Coords {
    se: {
        lat: string
        long: string
    }
    nw: {
        lat: string
        long: string
    }
}

export interface Session {
    type: string
    sessionId: string
    startTime: string
    expiry: number
    userId: string
    endTime?: string
    active?: boolean
}

export const USER_TYPE = "USR#"
export const SESSION_TYPE = "SES#"
