import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthenticatedUser, OnceUser } from "./types"
import { ReactComponent as BackButton } from "./images/back_arrow.svg"
import { ReactComponent as Check } from "./images/check.svg"
import axios from "axios"

import { useDetectClickOutside } from "react-detect-click-outside"
import { AuthContext } from "./AuthenticatedUserContext"




function TopBar() {

    const location = useLocation()
    const pathname = location.pathname
    let navigate = useNavigate()
    const [friendRequests, setFriendRequests] = useState<OnceUser[]>([])

    const{ authenticatedUser, setAuthenticatedUser } = useContext(AuthContext) 

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
        baseURL = ""
    }

    useEffect(() => {
        Promise.all(authenticatedUser.incomingFriendRequests.map(x => {
            return axios.get(baseURL + "/api/get_user_by_id", { params: { "_id": x } })
        })).then(results => {
            if (results) {
                //console.log("top test", results)
                setFriendRequests(results.map(x => { return x.data }))
            }
        })
    }, [])

    var backButton = <></>
    if (pathname !== "/home") {
        backButton = <BackButton style={{ width: "38px", height: "38px", marginRight: "auto" }} onClick={() => { navigate("/home") }} />
    }
    return (
        <div style={{
            display: "flex", flexDirection: "row", justifyContent: "right",
            boxSizing: "border-box",
            alignItems: "center", width: "100%", height: "72px", borderStyle: "solid",
            borderWidth: "2px", borderColor: "black", borderRadius: "8px" }}>
            {backButton}
            <NotificationsButton friendRequests={friendRequests} />
            <p style={{ fontSize: "32px", marginRight: "12px" }}>{authenticatedUser.username}</p>
            <img className="profile_picture" onClick={navigateToProfile} width={"48px"} height={"48px"} style={{
                marginRight: "12px"
            }} src={authenticatedUser.userPfp}></img>
        </div>)

    function navigateToProfile() {
        navigate("/profile", { state: { userToView: authenticatedUser } })
    }
}

export async function acceptFriendRequest(friendID: string, _id: string) {

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
        baseURL = ""
    }
    try {
        const acceptRes = await axios.get(baseURL + "/api/accept_friend_request", { params: { "_id": _id, "friendID": friendID } })
        return acceptRes
    }
    catch (error) {
        throw error
    }
}
export interface NotificationsButtonProps {
    friendRequests: OnceUser[]
}

export const NotificationsButton = (props: NotificationsButtonProps) => {
    const [showNotifications, setShowNotifications] = useState(false)
    const ref = useDetectClickOutside({
        onTriggered: () => {
            setShowNotifications(false)
        }
    })
    var outputButtons = props.friendRequests.map(x => {
        return (<FriendRequestItem requestingUser={x} />)
    })
    var className = "border_div"
    if (outputButtons.length === 0) {
        outputButtons.push(<p className="small_text">No friend requests...</p>)
    }
    var dropDown = <div className={className} style={{ position: "absolute", left: 0, top: 40, width: "280px", background: "#FFF" }}>
        {outputButtons}
    </div>

    return (<div ref={ref} style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <button onClick={() => {
            setShowNotifications(!showNotifications)
        }} className="small_button" style={{ fontSize: "32px", margin: 0 }}>👥</button>
        {showNotifications && dropDown}
    </div>)
}



export interface FriendRequestItemProps {
    requestingUser: OnceUser
}

export const FriendRequestItem = (props: FriendRequestItemProps) => {
    const {authenticatedUser, setAuthenticatedUser} = useContext(AuthContext)
    const [accepted, setAccepted] = useState(false)
    const acceptedButton = <button
        style={{ marginRight: "12px", minWidth: "110px" }} className="small_button" >Accepted ✅</button>
    const acceptButton = <button onClick={() => {
        acceptFriendRequest(props.requestingUser._id, authenticatedUser._id)
            .then(response => {
                if (response.status === 200) {
                    setAccepted(true)                    
                    // setAuthenticatedUser(response.data)
                }
                else {
                    window.alert("An error occured. Try again later.")
                }
            })
    }} className="small_button" style={{ marginRight: "12px", minWidth: "110px" }} >Accept</button>

    var button = acceptButton
    if (accepted) {
        button = acceptedButton
    }
    return (<div style={{
        display: "flex", flexDirection: "row", justifyContent: "right", alignItems: "center" }}>
        <p className="small_text" style={{ margin: "12px", fontSize: '22px' }}>{props.requestingUser.username}</p>
        <img style={{ marginRight: "12px" }} className="profile_picture" width="48px" height="48px" src={props.requestingUser.userPfp}></img>
        {button}
    </div>)
}

export default TopBar