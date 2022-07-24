import { ReactComponent as Star } from "./images/star.svg"
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { CSSProperties } from "react";
import { PostType } from "./types";

export interface StarButtonProps {
    _id: string
    userID: string
    post: PostType
    liked: boolean
    sendLike: ()=>void
}
function StarButton(props: StarButtonProps) {    

    var starStyle: CSSProperties = { width: "32px", height: "32px", fill: "white" }
    if (props.liked) {
        console.log("star is liked")
        starStyle = { width: "32px", height: "32px", fill: "#FAFF00" }
    }
    else{
        console.log("star is not liked")
    }

    return (
        <div style={{ display: "flex", flexDirection: 'row', height: "28px", alignItems: "center" }}>
            <Star style={starStyle} onClick={()=>{
                props.sendLike()
            }} ></Star>
        </div>
    )

}
export default StarButton