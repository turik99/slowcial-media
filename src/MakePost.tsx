import axios from "axios"
import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AuthenticatedUser } from "./types"

export interface MakePostProps {
    authenticatedUser: AuthenticatedUser
}
function MakePost(props: MakePostProps) {
    const authToken = props.authenticatedUser.authToken
    const phoneNumber = props.authenticatedUser.phoneNumber
    const navigate = useNavigate()
    const [description, setDescription] = useState("")
    const [fileUpload, setFileUpload] = useState<File>(new File([], ""))

    const fileInputRef = useRef<HTMLInputElement>(null)

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
      baseURL=""
    }

    var xButton = <></>
    if (fileUpload.name !== "") {
        xButton = <button onClick={() => {
            removeImage()
        }} style={{ background: "white", borderWidth: "2px", borderStyle: "solid", borderRadius: '8px', position: "absolute", right: 0, top: 0 }} >X</button>
    }


    var imageInput = <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file" accept="image/jpg,image/png,image/jpeg" onChange={(event) => {
            if (event.target.files != null) {
                const newFileName: string = makeid(8) + event.target.files[0].name
                var file: File = new File([event.target.files[0]], newFileName)
                setFileUpload(file)
            }
        }}></input>

    var imageInputStyled = <></>
    if (fileUpload.name === "") {
        imageInputStyled = <button style={{
            position: "absolute", bottom: "50%", background: "#FFFFFF", borderWidth: "2px",
            borderStyle: "solid", borderColor: "black", fontSize: "32px", zIndex: 0
        }} onClick={() => {
            if (fileInputRef.current != null) {
                fileInputRef.current.click()
            }
        }}>Choose Image</button>
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "100%" }}>
            <p style={{ fontSize: "32px", margin: "12px" }}>{getDateStringFromUnixTime(new Date().getTime() / 1000)}</p>
            <div style={{
                display: "flex", width: "100%", height: "480px", flexDirection: "column", justifyContent: "end", alignItems: "center",
                borderRadius: "8px", borderStyle: "solid", borderWidth: "2px", borderColor: "black", position: 'relative'
            }}>
                {xButton}
                <img style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: -10 }}
                    src={URL.createObjectURL(fileUpload)}></img>
                {imageInput}
                {imageInputStyled}
                <input placeholder="write a memorable caption" style={{ width: "100.8%", marginBottom: -1 }} className="special_input" type={"text"}
                    onChange={(event) => {
                        setDescription(event.target.value)
                    }}></input>

            </div>
            <button style={{
                fontSize: "32px", width: "100%",
                background: "#FAFF00", borderWidth: "2px",
                borderColor: "black", borderRadius: "8px",
                borderStyle: "solid", marginTop: "12px"
            }} onClick={makePost}>Share</button>
        </div>
    )

    function uploadImage() {
        var data = new FormData()
        data.append("user_image", fileUpload)
        return new Promise((resolve, reject) => {
            axios.post(baseURL + "/upload_user_image", data, { params: { "authToken": authToken, "phoneNumber": phoneNumber, "imageKey": fileUpload.name } })
                .then(response => {
                    if (response.status === 200) {
                        console.log("success uploading image", response.data)
                        resolve(response.data)

                    }
                    else {
                        reject()
                    }
                })
                .catch(error => {
                    console.log("error from upload user image", error)
                    reject(error)
                })
        })

    }

    function removeImage() {
        setFileUpload(new File([], ""))
    }

    // function deleteImage() {
    //     axios.post(  "/delete_user_image", {}, { params: { "imageKey": imageKeyFilename, "authToken": authToken, "phoneNumber": phoneNumber } })
    //         .then(result => {
    //             if (result.status === 200) {
    //                 setInputBackground(URL.createObjectURL(new Blob()))
    //                 setPictureUploaded(false)
    //             }
    //         })
    // }

    function makePost() {

        if (fileUpload.name !== "") {
            uploadImage().then(result => {
                axios.post(baseURL + "/make_post", {}, {
                    params: {
                        authToken: authToken, userID: props.authenticatedUser._id, userImage: fileUpload.name,
                        description: description, phoneNumber: phoneNumber
                    }
                })
                    .then(result => {
                        if (result.status === 200) {
                            navigate("/home")
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
            })
                .catch(error => {
                    console.log(error)
                })

        }
        else {

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