import axios from "axios"
import { debounce } from "lodash"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { uploadProfilePicture } from "./Profile"
function FinishSignUp() {

    var authToken = localStorage.getItem("authToken")
    var phoneNumber = localStorage.getItem("phoneNumber")

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [filename, setFilename] = useState("")
    const [fileUpload, setFileUpload] = useState<File>(new File([], ""))
    const [availableMessage, setAvailableMessage] = useState("")
    const debounceUsername = debounce(value => setUsername(value), 200);

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
        baseURL = ""
    }
    useEffect(() => {
        if (username !== "") {
            axios.get(baseURL + "/api/check_username", { params: { "username": username } })
                .then(result => {
                    if (result.status === 200) {
                        setAvailableMessage("available")
                    }
                    else {
                        setAvailableMessage("username taken")
                    }
                })
                .catch(error => {
                    setAvailableMessage("username taken")
                })
        }

    }, [username])


    return (<div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2>Finish Sign Up</h2>
        <h3>Profile Picture</h3>
        <div style={{ width: "100%", position: "relative", height: "240px" }}>
            <img style={{
                position: "absolute", left: "20%", top: "20%", width: "60%", height: "60%", borderWidth: "4px", borderColor: "#FAFF00",
                borderRadius: "50%", borderStyle: "solid", objectFit: "cover", zIndex: -1
            }}
                src={URL.createObjectURL(fileUpload)} />
            <input name="pfp" type="file" onChange={(event) => {
                if (event.target.files != null) {
                    const newFileName: string = makeid(8) + event.target.files[0].name
                    var file = new File([event.target.files[0]], newFileName)
                    setFilename(newFileName)
                    setFileUpload(file)
                }
            }}></input>
        </div>


        <input className="special_input" onChange={(event) => {
            debounceUsername(event.target.value)
        }} placeholder="username"></input>
        <p>{availableMessage}</p>
        <button style={{ borderStyle: "solid", borderWidth: "2px", borderColor: "black", fontSize: "22px", backgroundColor: "#FAFF00", borderRadius: "8px" }} onClick={
            () => {
                if (authToken != null) {
                    finishSignUp(authToken, username).then(res => {
                        navigate("/home")
                        window.location.reload()
                    }).catch(error => {
                        window.alert("An error occured during sign up. Try again later.")
                    })
                }
                else {
                    navigate("/signup")
                }
            }

        }>Create Account</button>
    </div >)



    async function finishSignUp(authToken: string, username: string): Promise<string> {
        var { userPfp } = await uploadProfilePicture(authToken, filename, fileUpload)

        return new Promise((reject, resolve) => {
            axios.get(baseURL + "/api/finish_signup", { params: { authToken: authToken, username: username, userPfp: userPfp } })
                .then(result => {
                    if (result.status === 500) {
                        if (result.data === "username taken") {
                            reject("username taken")
                        }
                        else {
                            reject("unknown error")
                        }
                    }
                    if (result.status === 200) {
                        resolve("success")
                    }
                })
                .catch(error => {
                    reject("unknown error")
                })

        })

    }




}
export function makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export default FinishSignUp