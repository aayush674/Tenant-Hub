import { useState } from "react";

function SignUp() {
    const [userType, setUserType] = useState(1);
    return (
        <div className="sign-up-container">
            <div className="sign-up-box">
                <div className="user-type-toggle">

                    <button type="button" className={userType === 1 ? "active" : ""} onClick={() => {
                        setUserType(1);
                        // if (error?.roomCapacity) {
                        //     const newError = { ...error };
                        //     delete newError.roomCapacity;
                        //     setError(newError);
                        // }
                    }
                    }>Tenant</button>
                    <button type="button" className={userType === 2 ? "active" : ""} onClick={() => {
                        setUserType(2);
                        // if (error?.roomCapacity) {
                        //     const newError = { ...error };
                        //     delete newError.roomCapacity;
                        //     setError(newError);
                        // }
                    }
                    }>Employee</button>

                    {userType === 1 && (
                        <div className="tenant-signup-form">
                            <input 
                                type="text"
                                placeholder="Enter First Name"
                            />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
export default SignUp;