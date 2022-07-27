import React, { useEffect, useState} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthenticatedUser, OnceUser } from "./types"
import { ReactComponent as BackButton } from "./images/back_arrow.svg"
import { ReactComponent as Check } from "./images/check.svg"
import axios from "axios"

import { useDetectClickOutside } from "react-detect-click-outside"
import { useAuth } from "./AuthenticatedUserContext"


export interface TopBarProps{ 
    authenticatedUser: AuthenticatedUser
}


function TopBar(props: TopBarProps) {

    const location = useLocation()
    const pathname = location.pathname
    let navigate = useNavigate()
    const [friendRequests, setFriendRequests] = useState<OnceUser[]>([])

    const authenticatedUser = props.authenticatedUser

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
        baseURL=""
    }

    useEffect(() => {
        Promise.all(authenticatedUser.incomingFriendRequests.map(x => {
            return axios.get(baseURL + "/get_user", { params: { "_id": x } })
        })).then(results => {
            if (results) {
                console.log("top test", results)
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
            borderWidth: "2px", borderColor: "black", borderRadius: "8px"
        }}>
            {backButton}
            <NotificationsButton friendRequests={friendRequests} />
            <p style={{ fontSize: "32px", marginRight: "12px" }}>{authenticatedUser.username}</p>
                <img onClick={navigateToProfile} width={"48px"} height={"48px"} style={{
                    borderRadius: "50%", borderWidth: "4px",
                    borderStyle: "solid", borderColor: "#FAFF00", marginRight: "12px"
                }} src={authenticatedUser.userPfp}></img>            
        </div>)

    function navigateToProfile() {
        navigate("/profile", { state: { userToView: authenticatedUser } })
    }
}

export async function acceptFriendRequest(friendID: string, _id: string) {

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
        baseURL=""
    }
        try{
            const acceptRes = await axios.get(baseURL + "/accept_friend_request", { params: { "_id": _id, "friendID": friendID } })
        }
        catch(error){

        }
}
export interface NotificationsButtonProps {
    friendRequests: OnceUser[]
}

export const NotificationsButton = (props: NotificationsButtonProps) => {
    const [showNotifications, setShowNotifications] = useState(false)
    const ref = useDetectClickOutside({ onTriggered: () => { 
        setShowNotifications(false) } })
    var outputButtons = props.friendRequests.map(x => {
        return(<FriendRequestItem requestingUser={x} />)
    })
    var className = "border_div"
    outputButtons.push(<p className="small_text">No friend requests...</p>)
    var dropDown = <div className={className} style={{position:"absolute", left: 0, top: 40, width: "280px"}}>
        {outputButtons}
    </div>

    return (<div ref={ref} style={{position: "relative", display: "flex", flexDirection: "column"}}>
        <button onClick={()=>{
            setShowNotifications(!showNotifications)
        }} className="small_button" style={{fontSize: "32px", margin: 0}}>👥</button>
        {showNotifications && dropDown}
    </div>)
}



export interface FriendRequestItemProps {
    requestingUser: OnceUser
}
export const FriendRequestItem = (props: FriendRequestItemProps) => {
    const authenticatedUser = useAuth()
    const [accepted, setAccepted] = useState(false)
    const acceptedButton = <button
    style={{marginRight: "12px", minWidth: "110px"}} className="small_button" >Accepted ✅</button>
    const acceptButton = <button onClick={ () => {
        acceptFriendRequest(props.requestingUser._id, authenticatedUser._id)
            .then(response => {
                setAccepted(true)
            })
    }} className="small_button" style={{marginRight: "12px", minWidth: "110px"}} >Accept</button>

    var button = acceptButton
    if (accepted){
        button = acceptedButton
    }
    return (<div style={{ display: "flex", flexDirection: "row", justifyContent: "right", alignItems: "center"
    }}>
        <p className="small_text" style={{margin: "12px", fontSize: '22px'}}>{props.requestingUser.username}</p>
        <img style={{marginRight: "12px"}} className="profile_picture" width="48px" height="48px" src={props.requestingUser.userPfp}></img>
        {button}
    </div>)
}

export default TopBar