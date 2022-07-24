import { useLocation } from "react-router-dom"
import ProfileTimeLine from "./ProfileTimeLine"
import { AuthenticatedUser, OnceUser } from "./types"
import axios from "axios"
import { useRef, useState } from "react"
import { useDetectClickOutside } from "react-detect-click-outside"
import editPfpSvg from "./images/editpfp.svg"
import { makeid } from "./FinishSignUp"
import Resizer from "react-image-file-resizer"

export interface ProfileProps {
    authenticatedUser: AuthenticatedUser
}

export interface LocationType {
    state: {
        userToView: OnceUser
    }
}

function Profile(props: ProfileProps) {

    const authToken = props.authenticatedUser.authToken
    const phoneNumber = props.authenticatedUser.phoneNumber
    const location = useLocation() as LocationType
    const state = location.state
    const userToView = state.userToView as OnceUser
    const requestSent = props.authenticatedUser.outgoingFriendRequests.includes(userToView._id)
    const isFriends = props.authenticatedUser.friends.includes(userToView._id)
    const isSelf = props.authenticatedUser._id === userToView._id

    const [editMode, setEditMode] = useState(false)
    const [showRequestButton, setShowRequestButton] = useState(false)
    const [showUnfriendButton, setShowHideUnfriend] = useState(false)
    const [fileUpload, setFileUpload] = useState<File>(new File([], ""))
    const [filename, setFileName] = useState<string>("")
    const [userPfp, setUserPfp] = useState<string>(userToView.userPfp)

    const fileInputRef = useRef<HTMLInputElement>(null)


    const unRequestButtonRef = useDetectClickOutside({
        onTriggered: () => {
            console.log("triggered request ref")
            setShowRequestButton(false)
        }
    });
    const unfriendButtonRef = useDetectClickOutside({
        onTriggered: () => {
            console.log("triggered unfriend ref")
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
        else { return "not friends" }
    })

    const UnsendRequestButton = () => {
        return (<button className="small_button" style={{
            width: "130px", position: "absolute", left: -20, top: 25
        }} onClick={() => {
            setShowRequestButton(false)
            unsendFriendRequest()
        }}>Unsend Request</button>)
    }


    const EditButton = () => {
        return (<button className="small_button" style={{
            marginTop: "12px"
        }} onClick={() => { setEditMode(!editMode) }}>Edit Profile Picture</button>
        )
    }

    const CancelChanges = () => {
        return (<button style={{}} onClick={() => {
            setUserPfp(props.authenticatedUser.userPfp)
            setEditMode(false)
        }} className="small_button">Cancel</button>)
    }

    const SaveChanges = () => {
        if (userPfp === props.authenticatedUser.userPfp) {
            return <button style={{ color: "lightgrey", marginTop: "12px" }} className="small_button" >Save Changes</button>
        }
        return (<button style={{ backgroundColor: "#FAFF00", marginTop: "12px" }} className="small_button"
            onClick={async () => {
                console.log("got to click handling")
                try {
                    const uploadRes = await uploadProfilePicture(props.authenticatedUser.authToken, filename, fileUpload)
                    setUserPfp(uploadRes.userPfp)
                    setEditMode(false)
                }
                catch (error) {
                    console.log(error)
                }
            }}>Save Changes</button>
        )
    }

    const UnfriendButton = () => {
        return (<button className="small_button" onClick={unfriend}>Unfriend</button>)
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
                    console.log("new file name", newFileName)
                    console.log("file name", file.name)
                    setFileName(file.name)
                    setFileUpload(file)
                    setUserPfp(URL.createObjectURL(file))
                }
            }}></input>
        const img = (
            <>
                <img onClick={() => {
                    console.log("clicked", fileInputRef.current)
                    if (fileInputRef.current != null) {
                        fileInputRef.current.click()
                    }
                }} className="profile_picture" style={{ zIndex: 1, position: "absolute", left: 0, top: 0 }}
                    width="108px" height="108px" src={editPfpSvg}></img>
                {imageInput}

            </>
        )


        return (
            <div style={{ display: "flex", flexDirection: "row", marginTop: "12px", alignItems: "center" }}>
                <p style={{ fontSize: "48px", margin: 0, marginRight: "12px" }}>{userToView.username}</p>
                <div style={{ margin: 0, position: "relative" }}>
                    <img style={{ zIndex: 0 }} className="profile_picture" width="108px" height="108px" src={userPfp}></img>
                    {props.editMode && img}
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
        }} onClick={unfriend}>Friends</button>
    }
    if (status === "not friends") {
        friendButtonContent = <button style={{
            borderStyle: "solid", borderRadius: "4px",
            borderColor: "black", fontSize: "15px", borderWidth: "2px",
            background: "#FFFFFF"
        }} onClick={() => {
            sendFriendRequest(userToView._id, authToken, phoneNumber)
                .then(result => {

                    setStatus(result)
                })
        }}>Add Friend</button>

    }


    var friendButton = < div ref={unRequestButtonRef} style={{ position: "relative" }}>
        {friendButtonContent}
        {showRequestButton && (<UnsendRequestButton />)}
        {showUnfriendButton && (<UnfriendButton />)}
    </div>

    function unsendFriendRequest() {
        axios.post("/unsend_friend_request", {}, { params: { "authToken": authToken, "phoneNumber": phoneNumber, "friendID": userToView._id } })
            .then(result => {
                if (result.status === 200) {
                    setStatus("not friends")
                }
            })
    }

    function unfriend() {
        axios.post("/unfriend", {}, { params: { "friendID": userToView._id, "authToken": authToken, "phoneNumber": phoneNumber } })
            .then(result => {
                if (result.status === 200) {
                    setStatus("not friends")
                }
            })

    }

    console.log("userToView", userToView)
    var editOrSave = <></>
    if (editMode) {
        editOrSave = <div style={{ margin: 0 }}>
            <SaveChanges />
            <CancelChanges />

        </div>

    }
    else {
        if (props.authenticatedUser._id !== userToView._id) {
            editOrSave = <></>
        }
        else {
            editOrSave = <EditButton />
        }
    }

    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {<ProfileNameAndPicture editMode={editMode} />}
        {!isSelf && (friendButton)}
        {editOrSave}
        <ProfileTimeLine userToView={userToView} authenticatedUser={props.authenticatedUser} />
    </div>)
}


interface UploadPFPResponseType {
    userPfp: string
}

export async function uploadProfilePicture(authToken: string, imageKey: string, fileUpload: File): Promise<UploadPFPResponseType> {
    var formData = new FormData()
    formData.append("pfp", fileUpload)
    try {
        return axios.post<UploadPFPResponseType>("/update_profile_picture", formData,
            { params: { "authToken": authToken, "imageKey": imageKey } }).then(response => { return response.data })
    }
    catch (error) { throw (error) }
}

export function sendFriendRequest(friendID: string, authToken: string, phoneNumber: string) {
    return new Promise<string>((resolve, reject) => {
        axios.post("/send_friend_request", {}, { params: { "friendID": friendID, "authToken": authToken, "phoneNumber": phoneNumber } })
            .then(result => {
                if (result.status === 200) {
                    resolve("request sent")
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