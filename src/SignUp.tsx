import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "react-phone-input-2"
import 'react-phone-input-2/lib/style.css'
import { VerifySMSResponseType } from "./types"


function SignUp() {


    const [phoneNumber, setPhoneNumber] = useState("")
    const [smsCode, setSMSCode] = useState("")
    const [codeSent, setCodeSent] = useState(false)


    let navigate = useNavigate()


    var content = <></>

    if (!codeSent) {
        content = <div>
            <div style={{
                width: "100%", display: "flex", height: "480px",
                flexDirection: "column", alignItems: "center"
            }} className="border_div">
                <h2 style={{margin: "12px"}}>Enter your phone number to Sign Up or Sign In</h2>
                <div style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h1>📲</h1>

                    <div className="special_input">
                    <Input country={'us'}
                        value={phoneNumber} onChange={setPhoneNumber}></Input>

                    </div>
                    <button className="small_button" style={{ fontSize: "28px", fontWeight: 'bold', marginTop: "12px", 
                backgroundColor: "#FAFF00" }} onClick={sendSMSCode}>Send Code</button>
                </div>
            </div>
        </div>
    }
    else {
        content = <div>
            <div className="border_div" style={{ width: "100%", display: "flex", flexDirection: "column", marginTop: "32px", alignItems: "center" }}>
                <h2>Verify Code</h2>
                <input className="special_input" style={{fontSize: "18px"}} onChange={(event) => { setSMSCode(event.target.value) }}></input>
                <button className="small_button"  style={{ fontSize: "28px", fontWeight: 'bold', marginTop: "12px" }} onClick={verifySMSCode}>Verify</button>
            </div>
        </div>
    }

    return (<div>
        {content}
    </div>)


    function verifySMSCode() {
        var phone = "+" + phoneNumber
        var timeCreated: number = Math.round((new Date().getTime()) / 1000)
        axios.post<VerifySMSResponseType>(  "/verify_sms_code", {}, { params: { phoneNumber: phone, smsCode: smsCode, timeCreated: timeCreated } })
            .then(
                (response) => {
                    if (response.status === 200) {
                        localStorage.setItem("authToken", response.data.authToken)
                        localStorage.setItem("phoneNumber", phone)
                        if (response.data.userExists === true) {
                            navigate("/home")
                        }
                        else {
                            navigate("/finishsignup")
                        }
                    }
                })

    }


    function sendSMSCode() {
        // Do stuff related to sign up
        //Send Phone Number to TWilio, and push the user to a new screen to enter their verification code
        //if the phone nuber already exists, ask them to sign in / sign up
        var phone = "+"+phoneNumber
        axios.post(  "/send_sms_code", {}, { params: { phoneNumber: phone } })
            .then((response) => {
                console.log("send code res", response)
                if (response.status === 200) {
                    setCodeSent(true)
                }
            })
            .catch(error => {
                console.log(error)
            })
    }
}

export interface PhoneNumber {
    phone: string
}



export default SignUp