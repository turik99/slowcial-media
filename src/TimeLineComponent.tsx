import { getDateStringFromUnixTime } from "./MakePost"
import Post from "./Post"
import { DateHeader } from "./Home"
import { AuthenticatedUser, PostType } from "./types"


export interface TimeLineComponentProps{
    authenticatedUser: AuthenticatedUser
    timelinePosts: PostType[]
}
function TimeLineComponent(props: TimeLineComponentProps){
    var timelineComponents = [
        // <Post post={testPostData} ></Post>
    ]


    for (var x = 0; x < props.timelinePosts.length; x++) {
        const timeStamp = props.timelinePosts[x].timeStamp
        if (x > 0 && getDateStringFromUnixTime(timeStamp) !== getDateStringFromUnixTime(props.timelinePosts[x - 1].timeStamp)
        || x === 0) {
            timelineComponents.push(<DateHeader key={timeStamp} unixTimeStamp={timeStamp} />)
        }
        timelineComponents.push(<div key={props.timelinePosts[x]._id.toString()} style={{ marginTop: "12px" }}>
            <Post authenticatedUser={props.authenticatedUser} post={props.timelinePosts[x]} />
        </div>)
    }
    return(<>
    {timelineComponents}
    </>)
}
export default TimeLineComponent