export function validateRoomNumber(roomNumber) {
  if (!roomNumber) {
    return "Please select Room before raising a request";
  } else if (isNaN(roomNumber)) {
    return "Room Number must be a valid Number";
  }
  return null;
}

export function validateCategory(category) {
  if (!category) {
    return "Please select Category before raising a request";
  }
  return null;
}
