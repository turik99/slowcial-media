import axios from "axios"
import React, { useState, Dispatch, SetStateAction, useEffect, useRef } from "react"
import {ReactComponent as ThreeDots} from "./images/three_dots.svg"
import { AuthenticatedUser, OnceUser, PostType } from "./types"
import { useDetectClickOutside } from "react-detect-click-outside"

export interface MoreButtonProps{
    authenticatedUser: AuthenticatedUser
    post: PostType,
    setDeleted: Dispatch<SetStateAction<boolean>>
}
function MoreButton(props: MoreButtonProps){

     
    const authToken = props.authenticatedUser.authToken
    const [showDelete, setShowDelete] = useState(false)
    const ref = useDetectClickOutside({ onTriggered: ()=>{setShowDelete(false)} });

    const DeleteButton = () =>{

        return(<button className="small_button" ref={ref} style={{ marginLeft: -20}} onClick={deletePost}>DELETE</button>)
    }


    if (showDelete){
        return(
        <div ref={ref} style={{display: "flex", flexDirection: "column", left: "92%", top: "12px", position: "absolute"}}>
            <ThreeDots height={"32px"} width="32px" onClick={() => {setShowDelete(!showDelete)}} />
            <DeleteButton  />
        </div>)
    }
    else{
        return(<div style={{left: "92%", top: "12px", position: "absolute"}}>
            <ThreeDots height={"32px"} width="32px" onClick={() => {setShowDelete(!showDelete)}}/>
        </div>)
    }





    
    function deletePost(){
        var imgKey = props.post.imgUrl.substring(props.post.imgUrl.lastIndexOf("/")+1, props.post.imgUrl.length)
        axios.post(  "/delete_post", {}, {params: {"_id": props.post._id, "authToken": authToken, "userID": props.authenticatedUser._id, 
            "imageKey": imgKey}})
        .then(result => {
            if (result.status === 200){
                console.log(result)
                props.setDeleted(true)
            }
        })
        .catch(error => {
            console.log("error", error)
        })
    }



}
export default MoreButton
