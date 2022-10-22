import { useLocation } from "react-router-dom"
import ProfileTimeLine from "../components/ProfileTimeLine"
import { AuthenticatedUser, OnceUser } from "../types"
import axios, { AxiosResponse } from "axios"
import { useContext, useRef, useState } from "react"
import { useDetectClickOutside } from "react-detect-click-outside"
import {ReactComponent as EditPFPSVG} from "./images/editpfp.svg"
import { makeid } from "./FinishSignUp"
import Resizer from "react-image-file-resizer"
import { AuthProvider } from "../AuthenticatedUserContext"
import { acceptFriendRequest } from "../components/TopBar"

export interface LocationType {
    state: {
        userToView: OnceUser
    }
}

export interface ProfileProps{
    authenticatedUser: AuthenticatedUser
}

function Profile(props: ProfileProps) {

    const authenticatedUser = props.authenticatedUser
    
    const authToken = authenticatedUser.authToken
    const phoneNumber = authenticatedUser.phoneNumber
    const location = useLocation() as LocationType
    const state = location.state
    const userToView = state.userToView as OnceUser
    const requestSent = authenticatedUser.outgoingFriendRequests.includes(userToView._id)
    const isFriends = authenticatedUser.friends.includes(userToView._id)
    const incomingRequest = authenticatedUser.incomingFriendRequests.includes(userToView._id)
    const isSelf = authenticatedUser._id === userToView._id
    
    const [editMode, setEditMode] = useState(false)
    const [showRequestButton, setShowRequestButton] = useState(false)
    const [showUnfriendButton, setShowHideUnfriend] = useState(false)
    const [fileUpload, setFileUpload] = useState<File>(new File([], ""))
    const [filename, setFileName] = useState<string>("")
    const [userPfp, setUserPfp] = useState<string>(userToView.userPfp)

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
      baseURL=""
    }
    const fileInputRef = useRef<HTMLInputElement>(null)


    const unRequestButtonRef = useDetectClickOutside({
        onTriggered: () => {
            //console.log("triggered request ref")
            setShowRequestButton(false)
            setShowHideUnfriend(false)
        }
    });

    const [status, setStatus] = useState<string>(() => {
        if (requestSent) {
            return "request sent"
        }
        if (isFriends) {
            return "friends"
        }
        if (incomingRequest){
            return "incoming request"
        }
        else {
            return "not friends" 
        }
    })

    const UnsendRequestButton = () => {
        return (<button className="small_button" style={{
            width: "150px", position: "absolute", left: -28, top: 26
        }} onClick={() => {
            setShowRequestButton(false)
            unsendFriendRequest()
        }}>Unsend Request ❌</button>)
    }


    const EditButton = () => {
        return (<button className="small_button" style={{
            marginTop: "12px"
        }} onClick={() => { setEditMode(!editMode) }}>Edit Profile Picture 📷</button>
        )
    }

    const CancelChanges = () => {
        return (<button style={{marginLeft: "12px"}} onClick={() => {
            setUserPfp(authenticatedUser.userPfp)
            setEditMode(false)
        }} className="small_button">Cancel ❌</button>)
    }

    const SaveChanges = () => {
        if (userPfp === authenticatedUser.userPfp) {
            return <button style={{ background: "#FAFF00", opacity: 0.4, marginTop: "12px" }} className="small_button" >Save Changes</button>
        }
        else{
            return (<button style={{ backgroundColor: "#FAFF00", marginTop: "12px" }} className="small_button"
            onClick={async () => {
                //console.log("got to click handling")
                try {
                    const uploadRes = await uploadProfilePicture(authenticatedUser.authToken, filename, fileUpload)
                    var updatedUser = authenticatedUser
                    updatedUser.userPfp = uploadRes.userPfp
                    setUserPfp(uploadRes.userPfp)
                    setEditMode(false)
                }
                catch (error) {
                    window.alert("An error occured while uploading this photo. Try a different one.")
                }
            }}>Save Changes</button>
        )

        }
    }

    const UnfriendButton = () => {

        return (<button className="small_button" style={{position: "absolute", left: -6, top: 27, width: "100px"}}  onClick={()=>{
            setShowHideUnfriend(false)
            unfriend()
        }}>Unfriend ❌</button>)
    }

    interface ProfileNameAndPictureProps {
        editMode: boolean
    }

    const ProfileNameAndPicture = (props: ProfileNameAndPictureProps) => {
        const imageInput = <input
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file" accept="image/jpg,image/png,image/jpeg" onChange={async (event) => {
                if (event.target.files != null) {
                    const newFileName: string = makeid(8) +  (event.target.files[0].name).replaceAll(/[^a-z0-9]/gi, "").replaceAll(" ", "")
                    var file: File = await compressProfilePicture( new File([event.target.files[0]], newFileName) )
                    // var file: File = new File([event.target.files[0]], newFileName, { type: event.target.files[0].type })
                    //console.log("new file name", newFileName)
                    //console.log("file name", file.name)
                    setFileName(file.name)
                    setFileUpload(file)
                    setUserPfp(URL.createObjectURL(file))
                }
            }}></input>
        const EditButton = (
            <>
                <EditPFPSVG onClick={() => {
                    //console.log("clicked", fileInputRef.current)
                    if (fileInputRef.current != null) {
                        fileInputRef.current.click()
                    }
                }} className="profile_picture" style={{ zIndex: 100, position: "absolute", left: 0, top: 0 }}
                    width="108px" height="108px" ></EditPFPSVG>
                {imageInput}

            </>
        )


        return (
            <div style={{ display: "flex", flexDirection: "column", marginTop: "12px", alignItems: "center" }}>
                <p style={{ fontSize: "48px", margin: 0 }}>{userToView.username}</p>
                <div style={{ margin: 0, position: "relative" }}>
                    <img style={{ zIndex: 0 }} className="profile_picture" width="108px" height="108px" src={userPfp}></img>
                    {props.editMode && EditButton}
                </div>

            </div>
        )
    }


    var friendButtonContent = <></>
    if (status === "request sent") {
        friendButtonContent = <button style={{
            borderStyle: "solid", borderRadius: "4px",
            borderColor: "black", fontSize: "15px", borderWidth: "2px",
            background: "#FFFFFF"
        }} onClick={() => { setShowRequestButton(!showRequestButton) }}>Requested</button>
    }
    if (status === "friends") {
        friendButtonContent = <button style={{
            borderStyle: "solid", borderRadius: "4px",
            borderColor: "black", fontSize: "15px", borderWidth: "2px",
            background: "#FFFFFF"
        }} onClick={() => { setShowHideUnfriend(!showUnfriendButton) }}>Friends ✅</button>
    }
    if (status === "not friends") {
        friendButtonContent = <button style={{
            borderStyle: "solid", borderRadius: "4px",
            borderColor: "black", fontSize: "15px", borderWidth: "2px",
            background: "#FFFFFF"
        }} onClick={() => {
            sendFriendRequest(userToView._id, authToken, phoneNumber)
                .then(result => {
                    if (result.status === 200){
                        setStatus("request sent")
                    }
                })
        }}>Add Friend</button>
    }
    if (status === "incoming request") { 
        friendButtonContent = <button style={{
            borderStyle: "solid", borderRadius: "4px",
            borderColor: "black", fontSize: "15px", borderWidth: "2px",
            background: "#FFFFFF"
        }} onClick={async () => {
            try{
                await acceptFriendRequest(userToView._id, props.authenticatedUser._id)
                setStatus("friends")    
            }
            catch(error){
                window.alert("An error occured. Try again later.")
            }
        }}>Accept</button>

    }


    var friendButton = < div ref={unRequestButtonRef} style={{ position: "relative" }}>
        {friendButtonContent}
        {showRequestButton && (<UnsendRequestButton />)}
        {showUnfriendButton && (<UnfriendButton />)}
    </div>

    function unsendFriendRequest() {

        var baseURL = "https://slowcial-media.herokuapp.com"
        if (window.location.href.includes("localhost")){
            baseURL = ""
        }
    

        axios.get(baseURL + "/api/unsend_friend_request",  { params: { "authToken": authToken, "phoneNumber": phoneNumber, "friendID": userToView._id } })
            .then(result => {
                if (result.status === 200) {
                    setStatus("not friends")
                }
                else{

                }
            })
    }

    function unfriend() {
        axios.get(baseURL + "/api/unfriend",  { params: { "friendID": userToView._id, "authToken": authToken, "phoneNumber": phoneNumber } })
            .then(result => {
                if (result.status === 200) {
                    setStatus("not friends")
                }
                else{
                    window.alert("an error occured :(")
                }
            })
            .catch(error => {
                window.alert("an error occured :(")
            })

    }

    //console.log("userToView", userToView)
    var editOrSave = <></>
    if (editMode) {
        editOrSave = <div style={{ }}>
            <SaveChanges />
            <CancelChanges />
        </div>

    }
    else {
        if (authenticatedUser._id !== userToView._id) {
            editOrSave = <></>
        }
        else {
            editOrSave = <EditButton />
        }
    }

    return (
        <AuthProvider >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                {<ProfileNameAndPicture editMode={editMode} />}
                {!isSelf && (friendButton)}
                {editOrSave}
                <ProfileTimeLine userToView={userToView} authenticatedUser={authenticatedUser} />
            </div>
        </AuthProvider>)
}


interface UploadPFPResponseType {
    userPfp: string
}

export async function uploadProfilePicture(authToken: string, imageKey: string, fileUpload: File): Promise<UploadPFPResponseType> {
    var formData = new FormData()
    formData.append("pfp", fileUpload)
    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
      baseURL = ""
    }
    
    try {
        return axios.post<UploadPFPResponseType>(baseURL + "/api/update_profile_picture", formData,
            { params: { "authToken": authToken, "imageKey": imageKey } }).then(response => { return response.data })
    }
    catch (error) { throw (error) }
}

export function sendFriendRequest(friendID: string, authToken: string, phoneNumber: string) {
    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
        baseURL=""
    }
    
    return new Promise<AxiosResponse>((resolve, reject) => {
        axios.get(baseURL + "/api/send_friend_request", { params: { "friendID": friendID, "authToken": authToken, "phoneNumber": phoneNumber } })
            .then(result => {
                if (result.status === 200) {
                    resolve(result)
                }
            }).catch(error => {
                reject(error)
            }).catch(error => {
                reject(error)
            })

    })
}


export async function compressProfilePicture(image: File): Promise<File> {

    
    return new Promise((resolve) => {
        Resizer.imageFileResizer(
            image,
            500,
            500,
            "JPEG",
            100,
            0,
            (uri) => {
                resolve(uri as File)
            },
            "file"
        );


    })
}


export default Profile