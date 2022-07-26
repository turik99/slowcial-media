
export interface OnceUser{
    _id: string
    username: string
    userPfp: string
    timeCreated: number
}

export interface AuthenticatedUser {
    _id: string
    username: string
    userPfp: string
    timeCreated: number
    userImageKeys: string[]
    authToken: string
    friends: string[]
    phoneNumber: string
    outgoingFriendRequests: string[]
    incomingFriendRequests: string[]
}

export interface VerifySMSResponseType {
    userExists: boolean
    authToken: string
    userIsFinished: boolean
}

export interface PostType{
    userID: string
    _id: string
    timeStamp: number
    postType: string
    imgUrl: string
    galleryUrls: string[]
    textContent: string
    usersWhoLiked: string[]
    comments: PostCommentsType[]
    localDate: string
}

export interface PostCommentsType {
    _id: string
    userID: string
    text: string
    mentions: string[]
    usersWhoLiked: string[]
}