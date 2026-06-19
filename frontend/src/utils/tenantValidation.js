export function validatePhoneNumber(phone) {
    if (!phone || phone.trim() === "") {
        return "Phone Number is required to add a Tenant"
    }
    else if(phone.split('-')[1].length!=10){
        return "Phone Number must contain exactly 10 digits"
    }
    return null;
    
}

export function validateEmail(email) {
    if (!email || email.trim() === "") {
        return "Email is required to add a Tenant"
    }
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return "Please enter a valid email";
    }
    return null;
}

export function validateName(name) {
    if (!name || name.trim() === "") {
        return "Name details are required to add a Tenant"
    }
    return null;
}

export function validateRoom(room){
    if(!room){
        return "Please assign a room to tenant."
    }
}

export function validateDate(date){
      if (!date) {
        return "Joining date is required to add a tenant";
    }

    const selectedDate = new Date(date);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        return "Joining date cannot be in future";
    }

    return null;
}