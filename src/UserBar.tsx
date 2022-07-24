import { AuthenticatedUser, OnceUser, PostType } from "./types"
import { useNavigate } from "react-router-dom"
import MoreButton from "./MoreButton"
import { Dispatch, SetStateAction } from "react"
export interface UserBarProps {
    authenticatedUser: AuthenticatedUser
    user: OnceUser,
    post: PostType,
    setDeleted: Dispatch<SetStateAction<boolean>>
}
function UserBar(props: UserBarProps) {
    const navigate = useNavigate()

    const isAuthedUserPost = props.user.username === props.authenticatedUser.username

    return (<div style={{
        height: "54px", width: "100%", display: "flex", flexDirection: "row", justifyContent: "left",
        borderStyle: "solid", boxSizing: "border-box", borderWidth: "2px", borderTopLeftRadius: "8px", borderBottomStyle: "none", borderTopRightRadius: "8px",
        borderColor: "black", alignItems: 'center', position: "relative"
    }}>
        <p onClick={navigateToProfile} style={{ fontSize: "22px", marginLeft: "12px" }}>{props.user.username}</p>
        <img onClick={navigateToProfile} style={{ borderRadius: "50%", borderColor: "#FAFF00", borderWidth: "5px", borderStyle: "solid", marginLeft: "12px" }} width="37px" height="37px" src={props.user.userPfp}></img>
        <div style={{marginLeft: "auto", marginTop: 0, marginBottom: 0, marginRight: "12px"}}>
            {isAuthedUserPost && (<MoreButton setDeleted={props.setDeleted} authenticatedUser={props.authenticatedUser} post={props.post}  />)}
        </div>
    </div>)

    function navigateToProfile() {
        navigate("/profile", { state: { userToView: props.user } })
    }

}
export default UserBar