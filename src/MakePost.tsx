import axios from "axios"
import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { DateHeader } from "./Home"
import {ReactComponent as Plus} from "./images/plus2.svg"
import { AuthenticatedUser } from "./types"

export interface MakePostProps {
    authenticatedUser: AuthenticatedUser,
}
function MakePost(props: MakePostProps) {
    const authToken = props.authenticatedUser.authToken
    const [description, setDescription] = useState("")
    const [fileUpload, setFileUpload] = useState<File>(new File([], ""))

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [todaysPrompt, setTodaysPrompt] = useState("")

    useEffect(()=> {
        getTodaysPrompt().then(res => {
            setTodaysPrompt(res)
        })
    }, [])

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
        baseURL = ""
    }

    var xButton = <></>
    if (fileUpload.name !== "") {
        xButton = <button onClick={() => {
            removeImage()
        }} className="small_button" style={{ position: "absolute", right: 0, top: 0 }} >❌</button>
    }


    var hiddenImageInput = <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file" accept="image/jpg,image/png,image/jpeg" onChange={(event) => {
            if (event.target.files != null) {
                const newFileName: string = makeid(8) + (event.target.files[0].name).replaceAll(/[^a-z0-9]/gi, "").replaceAll(" ", "")
                var file: File = new File([event.target.files[0]], newFileName)
                setFileUpload(file)
            }
        }}></input>

    var imageInputStyled = <></>
    var postButton = <></>
    if (fileUpload.name === "") {
        imageInputStyled = <button className="medium_button" style={{
            position: "absolute", bottom: "50%", width: "auto"}} onClick={() => {
            if (fileInputRef.current != null) {
                fileInputRef.current.click()
            }
        }}>Choose photo <Plus style={{marginBottom: -4}} width={"20px"} /></button>
        postButton = <button className="medium_button"style={{
            opacity: 0.3,
            marginTop: '12px',
            marginLeft: "-2px",
            height: "42px",
            width: "calc(100% + 4px)",
            marginBottom: -2
        }} >Post</button>
    }
    else{
        postButton = <button className="medium_button" style={{
            marginTop: '12px',
            marginLeft: "-2px",
            height: "42px",
            width: "calc(100% + 4px)",
            marginBottom: -2
        }} onClick={() => {
            makePost(authToken, props.authenticatedUser._id, fileUpload.name, description)
                .then(result => {
                    window.location.reload()
                }).catch(() => { window.alert("An error occured. Try again later.") })
        }}>Post</button>
    }

    var imageView = <img style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: -10 }}
        src={URL.createObjectURL(fileUpload)}></img>


    if (fileUpload.name === "") {
        imageView = <></>
    }

    return (
        <div className="border_div" style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "calc(100% - 4px)", marginTop: "12px" }}>
            <div style={{display: "flex", margin: "12px"}}>
                <p className="medium_text" style={{ margin: 0 }}>Make a post of:</p>
                <p className="medium_text" style={{  margin: 0, marginLeft: "6px", textDecoration: "underline" }}>{todaysPrompt}</p>
            </div>

            <div style={{
                display: "flex", padding: 0, width: "100%", height: "220px", flexDirection: "column", justifyContent: "end", alignItems: "center",
                position: 'relative', boxSizing: "content-box"
            }}>
                {xButton}
                {imageView}
                {hiddenImageInput}
                {imageInputStyled}
            </div>

            <input placeholder="write a memorable caption" style={{
                width: "calc(100% + 4px)", boxSizing: "border-box", marginLeft: "-2px"
            }} className="special_input" type={"text"}
                onChange={(event) => { setDescription(event.target.value) }}>
            </input>




            {postButton}
        </div>
    )

    function uploadImage(authToken: string, imageKey: string) {
        var data = new FormData()
        data.append("user_image", fileUpload)
        return new Promise((resolve, reject) => {
            axios.post(baseURL + "/api/upload_user_image", data, { params: { "authToken": authToken, "imageKey": imageKey } })
                .then(response => {
                    if (response.status === 200) {
                        //console.log("success uploading image", response.data)
                        resolve(response.data)
                    }
                    else {
                        reject()
                    }
                })
                .catch(error => {
                    //console.log("error from upload user image", error)
                    reject(error)
                })
        })

    }

    function removeImage() {
        setFileUpload(new File([], ""))
    }

    async function makePost(authToken: string, userID: string, imageKey: string, description: string) {
        try {
            const uploadRes = await uploadImage(authToken, imageKey)
            await axios.get(baseURL + "/api/make_post", { params: { authToken, userID, imageKey, description } })
            return "success"
        }
        catch (error) {
            throw error
        }


    }


    function makeid(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }



}

export async function getTodaysPrompt(): Promise<string> {
    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
        baseURL = ""
    }

    
    try {
        const val = await axios.get<string>(baseURL + "/api/get_todays_prompt")
        return val.data
    }
    catch (error) {
        throw error
    }
}


export function getDateStringFromUnixTime(unixTime: number) {
    const MILLISECONDS_IN_SECONDS = 1000
    const nth = function (d: number) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };


    var dateObj = new Date(unixTime * MILLISECONDS_IN_SECONDS)
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][dateObj.getMonth()];
    const year = dateObj.getFullYear();

    var dateString = month + ' ' + dateObj.getDate() + nth(dateObj.getDate()) + ', ' + year;
    return dateString
}

export default MakePost