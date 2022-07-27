import { useState, useEffect } from "react"
import TextPost from "./TextPost"
import ImagePost from "./ImagePost"
import { AuthenticatedUser, OnceUser, PostType } from "./types"
import GalleryPost from "./GalleryPost"
import UserBar from "./UserBar"
import axios from "axios"

export interface PostProps {
    post: PostType
    authenticatedUser: AuthenticatedUser
}

function Post(props: PostProps) {


    const [user, setUser] = useState<OnceUser>({ username: "", _id: "", userPfp: "", timeCreated: 0 })
    const [deleted, setDeleted] = useState(false)

    var baseURL = "http://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
        baseURL = ""
    }
    useEffect(() => {
        axios.get(baseURL + "/get_user", { params: { "_id": props.post.userID } })
            .then(userResult => {
                console.log("user result from user bar", userResult)
                setUser(userResult.data)
            })

    }, [])

    var content = <></>

    if (!deleted){
        if (props.post.postType === "image") {
            content =
                <div>
                    <UserBar setDeleted={setDeleted} post={props.post} authenticatedUser={props.authenticatedUser} user={user} />
                    <ImagePost authenticatedUser={props.authenticatedUser} post={props.post} ></ImagePost>
                </div>
        }    
    }


    return (<div style={{ width: "100%" }}>
        {content}
    </div>)

}
export default Post