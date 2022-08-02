import axios from "axios"
import { useEffect, useRef, useState } from "react"
import StarButton from "./StarButton"
import { AuthenticatedUser, OnceUser, PostType } from "./types"

export interface ImagePostProps {
    post: PostType,
    authenticatedUser: AuthenticatedUser
}

function ImagePost(props: ImagePostProps) {
     


    const [liked, setLiked] = useState(props.post.usersWhoLiked.includes(props.authenticatedUser._id))
    const [likeCount, setLikeCount] = useState(props.post.usersWhoLiked.length)
    //console.log("liked status: ", liked)
    var star = <StarButton sendLike={() => { sendLike(props.post._id, props.authenticatedUser._id) }} liked={liked} post={props.post} userID={props.authenticatedUser._id} _id={props.post._id} />


    return (<div style={{
        width: "100%", boxSizing: "border-box", borderWidth: '2px', borderColor: "black",
        borderBottomRightRadius: "8px", borderBottomLeftRadius: "8px",
        borderStyle: 'solid', display: 'flex', flexDirection: "column", alignItems: "left", borderTopStyle: "none"
    }}>
        <img src={props.post.imgUrl} width={"100%"} ></img>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "right", paddingRight: "12px" }}>

            <p style={{ fontSize: "15px", marginLeft: "12px", marginRight: "auto", fontWeight: "bold" }}>{props.post.textContent}</p>
            <p style={{ fontSize: "22px", marginRight: "6px" }}>{likeCount}</p>

            {star}
        </div>
    </div>)

    function sendLike(postID: string, userID: string) {
        var baseURL = "https://slowcial-media.herokuapp.com"
        if (window.location.href.includes("localhost")){
            baseURL = ""
        }
        axios.get(baseURL + "/api/like_post", { params: { "_id": postID, "userID": userID } })
            .then(result => {
                if (result.status === 200) {
                    setLiked(!liked)
                    if (liked){
                        setLikeCount(likeCount - 1)
                    }
                    else{
                        setLikeCount(likeCount + 1)
                    }
                }
            })
    }
}

export default ImagePost