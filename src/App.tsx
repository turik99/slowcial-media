import axios from 'axios';
import React, { useContext } from "react"
import { Route, Routes } from 'react-router-dom';
import './App.css';
import FinishSignUp from './pages/FinishSignUp';
import SignUp from './pages/SignUp';
import { useNavigate } from 'react-router-dom';
import { CSSProperties, useEffect, useState } from 'react';
import Home from './pages/Home';
import { AuthenticatedUser, OnceUser } from './types';
import MakePost from './components/MakePost';
import isMobile from 'is-mobile';
import TopBar from './components/TopBar';
import Profile from './pages/Profile';
import FindFriends from './pages/FindFriends';
import ReactDOM from 'react-dom';
import { AuthContext, AuthProvider, blankUser } from './AuthenticatedUserContext';
import { random } from 'lodash';




function App() {

  const  {authenticatedUser, setAuthenticatedUser} = useContext(AuthContext)
  const navigate = useNavigate()


  var baseURL = "https://slowcial-media.herokuapp.com"
  if (window.location.href.includes("localhost")) {
    baseURL = ""
  }

  useEffect(() => {
    if (localStorage.getItem("authToken") != null) {
      var authToken = localStorage.getItem("authToken")
      var phoneNumber = localStorage.getItem("phoneNumber")
      axios.get<AuthenticatedUser>(baseURL + "/api/get_user_by_auth_token", { params: { authToken: authToken, phoneNumber: phoneNumber } })
        .then(response => {
          if (response.data.username == null) {
            // console.log("user doesn't have name yet", response.data)
            navigate("/finishsignup")
          }
          else {
            console.log("user does have name", response.data)
            if (typeof setAuthenticatedUser !== "undefined"){
              // setAuthenticatedUser(response.data as AuthenticatedUser)
              var user:AuthenticatedUser = assignPropertiesToUser(response.data)
              setAuthenticatedUser(user)

            }
            navigate("/home")
          }
        })
        .catch(error => {
          //console.log(error)
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
    //console.log("authed user check", authenticatedUser)
    topBar = <TopBar/>
    home = <Home authenticatedUser={authenticatedUser} />
    profileComponent = <Profile authenticatedUser={authenticatedUser}/>
    findFriendsComponent = <FindFriends authenticatedUser={authenticatedUser} />
    makePostComponent = <MakePost authenticatedUser={authenticatedUser}  />
  }

  return (
    <AuthProvider >
      <div style={style}>
          {topBar}
        <div style={{ width: "100%"}}>        
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

export function assignPropertiesToUser(user: AuthenticatedUser):AuthenticatedUser { 
  var output = blankUser
  output._id = user._id
  output.username = user.username
  output.userPfp = user.userPfp
  output.timeCreated = user.timeCreated
  output.userImageKeys = user.userImageKeys
  output.authToken = user.authToken
  output.friends = user.friends
  output.phoneNumber = user.phoneNumber
  output.outgoingFriendRequests = user.outgoingFriendRequests
  output.incomingFriendRequests = user.incomingFriendRequests

  return output
}

export default App;
