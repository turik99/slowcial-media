import axios from 'axios';
import React, { useContext } from "react"
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
import { AuthProvider, blankUser } from './AuthenticatedUserContext';




function App() {

  const  [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser>(blankUser)
  const navigate = useNavigate()


  var baseURL = "https://slowcial-media.herokuapp.com"
  if (window.location.href.includes("localhost")) {
    baseURL = ""
  }

  useEffect(() => {
    if (localStorage.getItem("authToken") != null) {
      var authToken = localStorage.getItem("authToken")
      var phoneNumber = localStorage.getItem("phoneNumber")
      axios.get<AuthenticatedUser>(baseURL + "/get_user_by_auth_token", { params: { authToken: authToken, phoneNumber: phoneNumber } })
        .then(response => {
          if (response.data.username == null) {
            console.log("user doesn't have name yet", response.data)
            navigate("/finishsignup")
          }
          else {
            console.log("user does have name", response.data)
            setAuthenticatedUser(response.data)
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


  var style: CSSProperties = { display: "flex", marginTop: "2px", width: "480px", marginLeft: "auto", marginRight: "auto", flexDirection: "column", alignItems: "center" }
  if (isMobile() || window.innerWidth < 650) {
    style = { display: "flex", marginTop: "2px", marginLeft: "5%", marginRight: "5%", flexDirection: "column", alignItems: "center" }
  }

  var home = <></>
  var profileComponent = <></>
  var findFriendsComponent = <></>
  var makePostComponent = <></>
  var topBar = <></>

  if (authenticatedUser.username !== "") {
    console.log("authed user check", authenticatedUser)
    topBar = <TopBar authenticatedUser={authenticatedUser}/>
    home = <TimeLine authenticatedUser={authenticatedUser} />
    profileComponent = <Profile authenticatedUser={authenticatedUser}/>
    findFriendsComponent = <FindFriends authenticatedUser={authenticatedUser} />
    makePostComponent = <MakePost authenticatedUser={authenticatedUser} />
  }

  return (
    <AuthProvider >
      <div style={style}>
        <div style={{position: "fixed", width: "480px"}}>
          {topBar}
        </div>
        <div style={{marginTop: 100, width: "100%"}}>        
          <Routes>
          <Route path="makepost" element={makePostComponent} />
          <Route path="signup" element={<SignUp />} />
          <Route path="home" element={home} />
          <Route path="finishsignup" element={<FinishSignUp />} />
          <Route path="profile" element={profileComponent} />
          <Route path="search" element={findFriendsComponent} />
        </Routes>


        </div>
      </div>
    </AuthProvider>

  );
}

export default App;
