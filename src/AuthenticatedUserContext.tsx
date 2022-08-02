import React, { useState, Dispatch, SetStateAction,  useEffect, createContext } from "react"
import { AuthenticatedUser } from "./types"



export const blankUser = {
    _id: "",
    username: "",
    userPfp: "",
    timeCreated: 0,
    userImageKeys: [""],
    authToken: "",
    friends: [""],
    phoneNumber: "",
    outgoingFriendRequests: [] as string[],
    incomingFriendRequests: [] as string[]
}

export interface AuthContextType{
    authenticatedUser: AuthenticatedUser,
    setAuthenticatedUser: Dispatch<SetStateAction<AuthenticatedUser>>
}

const authContextDefaultValue:AuthContextType = {
    authenticatedUser: blankUser as AuthenticatedUser,
    setAuthenticatedUser: authenticatedUser => {}
}

export const AuthContext = createContext(authContextDefaultValue)
// wrapper for the provider
export const AuthProvider = (props: any) => {
    const [authenticatedUser, setAuthenticatedUser] = useState(authContextDefaultValue.authenticatedUser);

    useEffect(()=>{
        console.log("state changed", authenticatedUser)
    })

    return (
        <AuthContext.Provider value={{authenticatedUser, setAuthenticatedUser}}>
            {props.children}
        </AuthContext.Provider >

    )
}
