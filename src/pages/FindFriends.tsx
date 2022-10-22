import axios from "axios"
import { useState, useEffect } from "react"
import { AuthenticatedUser, OnceUser } from "../types"
import { debounce } from "lodash"
import { useNavigate } from "react-router-dom"

export interface FindFriendsProps {
    authenticatedUser: AuthenticatedUser
}

function FindFriends(props: FindFriendsProps) {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [results, setResults] = useState<OnceUser[]>([])

    const debounceSearch = debounce(value => setSearchTerm(value), 200);

    var baseURL = "https://slowcial-media.herokuapp.com"
    if (window.location.href.includes("localhost")) {
      baseURL = ""
    }
  

    useEffect(() => {
        if (searchTerm !== "") {
            axios.get<OnceUser[]>(baseURL + "/api/search_users", { params: { "searchTerm": searchTerm } })
                .then(result => {
                    var r: OnceUser[] = []
                    result.data.map(x => { r.push(x) })
                    setResults(r)
                })
                .catch(error => { {window.alert("An error occured. Try again later.")} })
        }
        else {
            setResults([])
        }
    }, [searchTerm])

    interface ProfileResultProps {
        authenticatedUser: AuthenticatedUser
        user: OnceUser
    }

    const ProfileResult = (props: ProfileResultProps) => {
        return (<div key={props.user._id} onClick={() => {
            navigate("/profile", { state: { userToView: props.user } })
        }}>
            <div style={{ display: "flex", marginTop: "12px", flexDirection: "row", height: "48px", justifyContent: "right", alignItems: "center", paddingLeft: "12px" }}>
                <p style={{ marginLeft: "12px", marginRight: 'auto', }} className="medium_text">{props.user.username}</p>
                <img src={props.user.userPfp} height="48px" width="48px" style={{ borderRadius: "50%", borderWidth: "4px", borderStyle: "solid", borderColor: "#FAFF00", marginRight: "12px" }}></img>

            </div>
            <div style={{ height: "1px", backgroundColor: "grey", width: "100%" }}></div>
        </div>)
    }

    interface ResultsProps {
        authenticatedUser: AuthenticatedUser
        users: OnceUser[]
    }

    const Results = (props: ResultsProps) => {
        return (<div style={{ borderWidth: "2px", marginTop: "12px", height: "480px", borderRadius: "8px", borderColor: "black", borderStyle: "solid" }}>
            {props.users.map(x => { return (<ProfileResult authenticatedUser={props.authenticatedUser} user={x} />) })}
        </div>)
    }


    return (<div style={{ marginTop: '12px', width: "100%" }}>
        <input style={{ width: "100%", boxSizing: "border-box" }} onChange={(event) => {
            debounceSearch(event.target.value)
        }} placeholder="Username" className="special_input" />
        <Results authenticatedUser={props.authenticatedUser} users={results} />
    </div>)

}
export default FindFriends