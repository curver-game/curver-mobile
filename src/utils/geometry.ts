type Vector = {
    x: number
    y: number
}

export function convertDegreesToUnitVector(degrees: number): Vector {
    return convertRadiansToUnitVector(degreesToRadians(degrees))
}

export function convertUnitVectorToDegrees(vector: Vector) {
    return radiansToDegrees(convertUnitVectorToRadians(vector))
}

export function convertRadiansToUnitVector(radians: number): Vector {
    return {
        x: Math.cos(radians),
        y: Math.sin(radians),
    }
}

export function convertUnitVectorToRadians(vector: Vector): number {
    return Math.atan2(vector.y, vector.x)
}

export const degreesToRadians = (degrees: number) => {
    return (degrees * Math.PI) / 180
}

export const radiansToDegrees = (radians: number) => {
    return (radians * 180) / Math.PI
}
