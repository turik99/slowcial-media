import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import FinishSignUp from './FinishSignUp';
import SignUp from './SignUp';
import { useNavigate } from 'react-router-dom';
import { CSSProperties, useEffect, useState } from 'react';
import TimeLine from './TimeLine';
import { AuthenticatedUser, OnceUser } from './types';
import MakePost from './MakePost';
import isMobile from 'is-mobile';
import TopBar from './TopBar';
import Profile from './Profile';
import FindFriends from './FindFriends';
import ReactDOM from 'react-dom';


function App() {

   
  const navigate = useNavigate()

  
  const [user, setUser] = useState<AuthenticatedUser>()




  useEffect(() => {



    if (localStorage.getItem("authToken") != null) {
      var authToken = localStorage.getItem("authToken")
      var phoneNumber = localStorage.getItem("phoneNumber")
      axios.post(  "/get_user_by_auth_token", {}, { params: { authToken: authToken, phoneNumber: phoneNumber } })
        .then(response => {
          if (response.data.username == null) {
            console.log("user doesn't have name yet", response.data)
            navigate("/finishsignup")
          }
          else {
            console.log("user does have name", response.data)
            response.data.phoneNumber = phoneNumber
            response.data.authToken = authToken
            setUser(response.data)
            navigate("/home")
          }
        })
        .catch(error => {
          console.log(error)
          navigate("/signup")
        })
    }
    else {
      navigate("/signup")
    }
  }, [])

  var topBar = <></>
  if (user != undefined) {
    topBar = <TopBar user={user} />
  }


  var style: CSSProperties = { display: "flex", marginTop: "2px", width: "480px", marginLeft: "auto", marginRight: "auto", flexDirection: "column", alignItems: "center" }
  if (isMobile() || window.innerWidth < 650) {
    style = { display: "flex", marginTop: "2px", marginLeft: "5%", marginRight: "5%", flexDirection: "column", alignItems: "center" }
  }

  var timelineComponent = <></>
  var profileComponent = <></>
  var findFriendsComponent = <></>
  var makePostComponent = <></>
  if (user != undefined) {
    timelineComponent = <TimeLine authenticatedUser={user} />
    profileComponent = <Profile authenticatedUser={user} />
    findFriendsComponent = <FindFriends authenticatedUser={user} />
    makePostComponent = <MakePost authenticatedUser={user} />
  }

  return (
    <div style={style}>
      {topBar}
      <Routes>
        <Route path="makepost" element={makePostComponent} />
        <Route path="signup" element={<SignUp />} />
        <Route path="home" element={timelineComponent} />
        <Route path="finishsignup" element={<FinishSignUp />} />
        <Route path="profile" element={profileComponent} />
        <Route path="search" element={findFriendsComponent} />
      </Routes>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root") )

export default App;
