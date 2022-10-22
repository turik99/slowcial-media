import axios from "axios";
import { useState, useEffect } from "react";

import Post from "../components/Post";
import { useNavigate } from "react-router-dom";
import { AuthenticatedUser, OnceUser, PostType } from "../types";
import MakePost, { getDateStringFromUnixTime, getTodaysPrompt } from "../components/MakePost";
import TimeLineComponent from "../components/TimeLineComponent";
import {ReactComponent as Search} from "./images/search.svg"

export interface HomeProps {
    authenticatedUser: AuthenticatedUser,
}

function Home(props: HomeProps) {
    //Get posts and render them inline one after another in time order.
    //Paginate by Day and allow user to render more. 
    const [timelinePosts, setTimelinePosts] = useState(Array<PostType>)
    const navigate = useNavigate()
    const authToken = props.authenticatedUser.authToken
    const phoneNumber = props.authenticatedUser.phoneNumber
    const [canPost, setCanPost] = useState(false)

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")){
      baseURL=""
    }
    useEffect(() => {
        // Run! Like go get some data from an API.
        if (props.authenticatedUser) {

            Promise.all([axios.get(baseURL + "/api/get_timeline", {
                params: {
                    "phoneNumber": phoneNumber,
                    "authToken": authToken
                }
            }), axios.get(baseURL + "/api/get_time_of_last_post", {params: {"userID": props.authenticatedUser._id}})])
            .then(results => {
                if (results){
                    (async ()=> { 
                        const todaysPrompt = await getTodaysPrompt()
                        if (lastPost.promptPhrase === todaysPrompt){
                            //console.log(results[1].data.timeStamp)
                            setCanPost(false)
                        }
                        else{    
                            console.log(lastPost)
                            setCanPost(true)
                        }
                    })()

                    setTimelinePosts(results[0].data as PostType[])
                    const lastPost = results[1].data
                }
            })
            .catch(error => {
                window.alert("An error occured. Try again later.")
            })
        }
        else {
            navigate("/signup")
        }

        return ()=>{

        }
    }, [])


    const AddFriendsButton = () => {
        return (
            <button style={{ fontSize: "48px", marginTop: "12px", borderRadius: "8px", borderColor: "black", width: "100%", background: "#FAFF00", borderWidth: "2px", borderStyle: "solid" }}
                onClick={() => { navigate("/search") }} >Find Friends
                <Search width="38" height = "38" style={{marginLeft: "12px", marginBottom: -3}} />
                </button>
        )
    }


    
    
    
    var makePostButton = <MakeAPostButton navigate={navigate} />

    if (!canPost) {
        //don't show a make post button if the user posted in the past 12 hours
        makePostButton = <></>
    }

    var emptyMessage = <></>

    if (timelinePosts.length === 0) {
        emptyMessage = <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "left" }}>
            <p style={{ fontSize: "22px", margin: 0, marginTop: "12px" }}>It’s looking empty around here.</p>
            <p style={{ fontSize: "22px", margin: 0, marginTop: 0 }}>Make a post and add some friends to start!</p>
        </div>
    }


    return (<div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "left" }}>
        <AddFriendsButton />
        {emptyMessage}
        <div>
            <MakePost authenticatedUser={props.authenticatedUser}  />
        </div>
        <TimeLineComponent authenticatedUser={props.authenticatedUser} timelinePosts={timelinePosts} />
    </div>)

}


export interface MakeAPostButtonProps {
    navigate: any
}

export const MakeAPostButton = (props: MakeAPostButtonProps) => {
    return (<button style={{
        width: "100%", fontSize: "48px", borderRadius: "8px", borderColor: "black", background:
            "#FAFF00", borderWidth: "2px", borderStyle: "solid", marginTop: "12px"
    }} onClick={() => { props.navigate("/makepost") }} >Make a Post</button>)
}

export interface DateHeaderProps {
    unixTimeStamp: number
}

export const DateHeader = (props: DateHeaderProps) => {
    return (<p style={{ fontSize: "32px", marginTop: "12px", marginBottom: 0 }}>{getDateStringFromUnixTime(props.unixTimeStamp)}</p>)
}
export default Home