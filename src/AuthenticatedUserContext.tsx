import React, { useState, useContext, useEffect, createContext } from "react"
import { AuthenticatedUser } from "./types"


export interface AuthContextType{
    authenticatedUser: AuthenticatedUser
    setAuthenticatedUser: (arg: AuthenticatedUser)=>void
}



export const blankUser = {
    _id: "",
    username: "",
    userPfp: "",
    timeCreated: 0,
    userImageKeys: [""],
    authToken: "",
    friends: [""],
    phoneNumber: "",
    outgoingFriendRequests: [],
    incomingFriendRequests: []
}

const AuthContext = createContext<AuthenticatedUser >(blankUser)

export function useAuth(){
    return useContext(AuthContext)
}
export function useUpdateAuth(arg: any): (arg: any)=>void {
    return useContext(UpdateAuthContext)
}

const UpdateAuthContext = createContext<any>(null)
// wrapper for the provider
export function AuthProvider ({ children }: any) {
    const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser>(blankUser);

    function setUser(user: AuthenticatedUser){
        setAuthenticatedUser(user)
    }

    return (
        <AuthContext.Provider value={authenticatedUser}>
            <UpdateAuthContext.Provider value = {(user: any) => {
                setUser(user)
            }}>
                {children}

            </UpdateAuthContext.Provider>
        </AuthContext.Provider >

    )
}
