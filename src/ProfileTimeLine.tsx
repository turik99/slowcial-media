import axios from "axios";
import { useState, useEffect } from "react";

import Post from "./Post";
import { useNavigate } from "react-router-dom";
import { AuthenticatedUser, OnceUser, PostType } from "./types";
import { getDateStringFromUnixTime } from "./MakePost";
import TimeLineComponent from "./TimeLineComponent";
import { DateHeader } from "./TimeLine";

export interface ProfileTimeLineProps {
    userToView: OnceUser
    authenticatedUser: AuthenticatedUser
}

function ProfileTimeLine(props: ProfileTimeLineProps) {
    //Get posts and render them inline one after another in time order.
    //Paginate by Day and allow user to render more. 
    const [timelinePosts, setTimelinePosts] = useState(Array<PostType>)

    useEffect(() => {
        // Run! Like go get some data from an API.
        axios.get(  "/get_user_posts", {
            params: {
                "userID": props.userToView._id
            }
        }).then(result => {
            setTimelinePosts(result.data)
            console.log("result from get timeline", result)
        })
    }, [])

    var emptyMessage = <></>

    if (timelinePosts.length === 0) {
        if (props.userToView._id === props.authenticatedUser._id){
            emptyMessage = <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "left" }}>
            <p style={{ fontSize: "28px" }}>You haven't made any posts yet.</p>
        </div>

        }
        else{
            emptyMessage = <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "left" }}>
            <p style={{ fontSize: "28px" }}>{props.userToView.username + " "}hasn't made any posts yet.</p>
        </div>

        }
    }

    return (<div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "left" }}>
        {emptyMessage}
        <TimeLineComponent authenticatedUser={props.authenticatedUser} timelinePosts = {timelinePosts} />
    </div>)

}
export default ProfileTimeLine