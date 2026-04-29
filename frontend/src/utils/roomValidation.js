export function validateRoomNumber(roomNumber) {
    if (!roomNumber || roomNumber.trim() === "") {
        return "Room Number is required to add a Room"
    }
    else if (isNaN(roomNumber)) {
        return "Room Number must be a valid Number"
    }
    return null;
}

export function validateRoomCapacity(roomCapacity) {
    if (!roomCapacity) {
        return "Room Capacity is required to add a Room"
    }
    return null;
}

export function validateRoomRent(roomRent) {
    if (!roomRent || roomRent.trim() === "") {
        return "Room Rent is required to add a Room"
    }
    else if (isNaN(roomRent)) {
        return "Room Rent must be a valid Number"
    }
    return null;
}