import { useState } from "react";

function VerifyCode() {

    var [smsCode, setSMSCode] = useState("")

    return (<div style={{
        width: "100%", display: "flex",
        flexDirection: "column", alignItems: "start", marginLeft: "32px"}}>
        <h2 >Verify the code sent to your phone number.</h2>
        <div style={{ width: "200px", display: "flex", flexDirection: "column" }}>
            <input type="tel" onChange={(event) => { setSMSCode(event.target.value) }}></input>
            <button onClick={verifyClick} >GO</button>
        </div>
    </div>)

    function verifyClick() {
        //send sms code to Twilio
        //if the SMS Code is valid send the phone number ot the server
        //if the user already exists, check for user details like name and username
        //if they do exist, then log them in 
        //if they don't exist, then allow them further sign up
        
    }

}
export default VerifyCode