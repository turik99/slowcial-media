import { OnceUser, PostType } from "./types"
import UserBar from "./components/UserBar"

export interface TextPostProps{
    post: PostType


}

function TextPost(props: TextPostProps){
    return(<div>
        <p>{props.post.textContent}</p>
        <p>{props.post.timeStamp}</p>
    </div>)

}
export default TextPost