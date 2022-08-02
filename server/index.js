const express = require('express');
const dotenv = require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const path = require('path');
const cors = require("cors")
const multer = require("multer")
const multers3 = require("multer-s3")
const authToken = process.env.TWILIO_AUTH_TOKEN;
const mongoURL = process.env.MONGO_URL
const { S3Client } = require("@aws-sdk/client-s3")
const { MongoClient, ObjectId } = require("mongodb")
const publicPath = path.join(__dirname, '..', 'public');
const aws = require("aws-sdk");
const { S3 } = require('aws-sdk');
const { lastIndexOf, rest } = require('lodash');
const { Router } = require('express');
const { DateTime } = require("luxon");


const app = express();
const port = process.env.PORT;



const twilioClient = require('twilio')(accountSid, authToken);

const mongoClient = new MongoClient(mongoURL)
const dbName = "1onceDB"
var mongoDatabase
const serviceSID = "VA189cbf6a022c2944b75bf5f91d0d4e75"
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})

const s3Client = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})


const upload = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const { originalname } = file
      const newName = "pfp/" + originalname
      cb(null, newName)
    }

  })
})

const uploadUserImage = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const { originalname } = file
      const newName = "userimages/" + originalname
      //console.log("ran key setter", newName)
      cb(null, newName)
    }

  })
})


aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
})


var usersCollection
var postsCollection
var promptsCollection


var promptPhrase
var promptDateString

mongoClient.connect().then(() => {
  mongoDatabase = mongoClient.db(dbName)
  usersCollection = mongoDatabase.collection("users")
  postsCollection = mongoDatabase.collection("posts")
  promptsCollection = mongoDatabase.collection("prompts")

  var today = DateTime.local();
  today.setZone("America/Los_Angeles")
  if (today.hour < 4) {
    today = today.minus({ days: 1 })
    promptDateString = today.toLocaleString({day: "2-digit", month: "2-digit"}) + "/" + today.year

  }
  else{
    promptDateString = today.toLocaleString({day: "2-digit", month: "2-digit"}) + "/" + today.year
  }
  
  console.log("today test", promptDateString)
  promptsCollection.findOne({ "date": promptDateString })
    .then(prompt => {
      if (prompt != null){
        promptPhrase = prompt.prompt
        console.log("prompt test", prompt)
      }
      else{
        promptPhrase = "This is a test phrase"
      }
    })
})


app.get("/api/send_sms_code", (req, res) => {
  //console.log("query test send code", req.query.phoneNumber)
  var phone = req.query.phoneNumber



  twilioClient.verify.services(serviceSID)
    .verifications
    .create({ to: phone, channel: 'sms' })
    .then(verification => { res.status(200).send(verification) });

})





app.get("/api/get_todays_prompt", async (req, res) => {
  if (promptPhrase != null) {
    res.status(200).send(promptPhrase)
  }
  else {
    res.status(500).send("error, couldn't fetch prompt!")
  }
})

app.get("/api/send_friend_request", async (req, res) => {
  var authToken = req.query.authToken
  var friendID = req.query.friendID

  try{
    const sendRes = await sendFriendRequest(authToken, friendID)
    res.status(200).send("success")
  }
  catch(error){
    res.status(500).send(error)
  }
})

async function sendFriendRequest(authToken, friendID) {
  try {
    token = authToken
    console.log("newfriend test", friendID)

    const newFriendID = new ObjectId(friendID)
    console.log("newfriend test", newFriendID)
    const sendingUser = await usersCollection.findOne({"authToken": token})
    await usersCollection.updateOne({ "authToken": token }, { $push: { "outgoingFriendRequests": newFriendID } })
    await usersCollection.updateOne({ "_id": newFriendID }, { $push: { "incomingFriendRequests": sendingUser._id } })
    return ("success")
  }
  catch (error) {
    console.log(error)
    throw error
  }
}


app.get("/api/unfriend", (req, res) => {
  var authToken = req.query.authToken
  var friendID = new ObjectId(req.query.friendID)
  usersCollection.findOneAndUpdate({ "authToken": authToken }, { $pull: { "friends": friendID } })
    .then(result => {
      if (result) {
        usersCollection.findOneAndUpdate({ "_id": new ObjectId(friendID) }, { $pull: { "friends": result.value._id } })
          .then(result => {
            res.status(200).send(result)
          })
          .catch(error => {
            res.status(500).send(error)
          })
      }
      else { res.status(500).send("") }
    })
    .catch(error => {
      res.status(500).send(error)
    })

})


async function unsendFriendRequest(authToken, friendIDarg, _id) {

  const friendID = new ObjectId(friendIDarg)
  const userID = new ObjectId(_id)
  try {
    await usersCollection.updateOne({ "authToken": authToken }, { $pull: { "outgoingFriendRequests": friendID } })
    await usersCollection.updateOne({ "_id": friendID }, { $pull: { "incomingFriendRequests": userID } })
    return "success"
  }
  catch (error) {
    //console.log(error)
    throw error
  }
}

app.get("/api/unsend_friend_request", async (req, res) => {
  var authToken = req.query.authToken
  var friendID = req.query.friendID
  var _id = req.query._id
  try {
    const unsendRes = await unsendFriendRequest(authToken, friendID, _id)
    res.status(200).send(unsendRes)
  }
  catch (error) {
    //console.log(error)
    res.status(500).send(error)
  }
})




app.get("/api/accept_friend_request", async (req, res) => {

  //console.log("accept req", req.query)
  const requesterID = req.query.friendID
  const acceptingID = req.query._id

  try {
    const requestRes = await acceptFriendRequest(requesterID, acceptingID)
    res.status(200).send("success")
  }
  catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

async function acceptFriendRequest(requesterIDarg, accepterIDarg) {
  const requesterID = new ObjectId(requesterIDarg)
  const accepterID = new ObjectId(accepterIDarg)
  try {
    //console.log("started acceptFriendRequest")
    await usersCollection.updateOne({ "_id": accepterID }, {
      $push: { "friends": requesterID },
    })
    await usersCollection.update({"_id": accepterID}, {
      $pull: {"incomingFriendRequests": requesterID}
    })

    //console.log(" acceptFriendRequest 2")

    await usersCollection.updateOne({ "_id": requesterID }, {
      $push: { "friends": accepterID }
    })

    await usersCollection.updateOne({ "_id": requesterID }, {
      $pull: { "outgoingFriendRequests": accepterID }
    })

    return ("success")
  }
  catch (error) {
    console.log(error)
    throw (error)
  }

}


app.get("/api/check_username", (req, res) => {
  //console.log("check username")
  const username = req.query.username
  usersCollection.findOne({ "username": username }).then(
    user => {
      if (user) {
        res.status(500).send("username taken")
      }
      else {
        res.status(200).send("username available")
      }
    }
  )
    .catch(error => {
      res.status(500).send(error)
    })
})


app.get("/api/search_users", (req, res) => {
  //console.log("search users", req.query)
  const searchTerm = req.query.searchTerm.toLowerCase()
  usersCollection.find({ "username": { "$regex": searchTerm } }, { projection: { "_id": 1, "username": 1, "userPfp": 1, timeCreated: 1 } })
    .limit(10)
    .toArray((error, result) => {
      if (error) {
        res.status(500).send(error)
      }
      res.status(200).send(result)
    })
})




app.get("/api/verify_sms_code", async (req, res) => {
  const phone = req.query.phoneNumber
  const smsCode = req.query.smsCode
  const timeCreated = Math.round(new Date().getTime() / 1000)
  try {
    const verifyResponse = await verifySmsCode(phone, smsCode, timeCreated)
    res.status(200).send(verifyResponse)
  }
  catch (error) {
    //console.log("verify sms error", error)
    res.status(500).send(error)
  }
})

async function verifySmsCode(phone, smsCode, timeCreated) {
  //if user exists and doesn't have details, sign in and send to details page
  //if user doesn't exist, create them in DB and send them to details page
  try {
    const twilioRes = await twilioClient.verify.services(serviceSID).verificationChecks
      .create({ to: phone, code: smsCode })
    if (twilioRes.status === "approved") {
      const authToken = makeid(10)
      const user = await usersCollection.findOne({ "phoneNumber": phone })
      if (user) {
        if (user.authToken != null) {
          //console.log('based!!!', user.authToken)
          if (user.username != "") {
            return ({ userExists: true, authToken: user.authToken, userIsFinished: true })
          }
          else {
            return ({ userExists: true, authToken: user.authToken, userIsFinished: false })
          }
        }
        else {
          const updateRes = await usersCollection.updateOne({ "phoneNumber": phone }, { $set: { "authToken": authToken } })
          return ({ userExists: true, authToken: authToken, userIsFinished: false })

        }

      }
      else {
        const insertRes = await usersCollection.insertOne({
          "phoneNumber": phone,
          "username": "",
          "userPfp": "",
          "authToken": authToken,
          "friends": [],
          "userImageKeys": [],
          "incomingFriendRequests": [],
          "timeCreated": timeCreated,
          "outgoingFriendRequests": [],
        })
        return ({ userExists: false, authToken: authToken })
      }
    }
    else {
      throw (twilioRes.status)
    }
  }
  catch (error) {
    throw (error)
  }
}



app.get("/api/delete_user_image", (req, res) => {
  var imageKey = req.query.imageKey
  var authToken = req.query.authToken
  deleteUserImage(imageKey, authToken).then(response => {
    res.status(200).send("success")
  })
    .catch(error => {
      res.status(500).send(error)
    })
})



function deleteProfilePictureFromAWS(imageKey) {
  return new Promise((resolve, reject) => {
    s3Client.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "pfp/" + imageKey
    }).promise().then(
      result => {
        resolve(result)
      }
    ).catch(error => {
      //console.log("error from deletepfp AWS", error)
      reject(error)
    })
  })
}




app.delete("/api/delete_profile_picture", async (req, res) => {
  var authToken = req.query.authToken
  var imageKey = req.query.imageKey
  try {

    const deleteProfileRes = await deleteProfilePicture(imageKey, authToken)
    res.status(200).send("success")
  }
  catch (error) {
    //console.log(error)
    res.status(500).send(error)
  }

})


async function deleteProfilePicture(imageKey, authToken) {
  try {
    const userResult = await usersCollection.findOne({ "authToken": authToken })
    if (userResult.userImageKeys.includes(imageKey)) {
      const setDefaultImgRes = await usersCollection.updateOne({ "authToken": authToken },
        { $set: { "userPfp": process.env.CLOUDFRONT_DIST_URL + "/pfp/" + "pfp.png" } })
      const deleteResult = await deleteProfilePictureFromAWS(imageKey)
      return (deleteResult)
    }
    else {
      throw ("wrong user")
    }
  }
  catch (error) {
    throw (error)
  }
}

app.delete("/api/delete_post", async (req, res) => {
  //console.log("ran delete post", req.query)
  var authToken = req.query.authToken
  var _id = req.query._id
  var imageKey = req.query.imageKey
  try {
    const deletePostRes = await deletePost(authToken, _id, imageKey)
    res.status(200).send("success")
  }
  catch (error) {
    //console.log(error)
    res.status(500).send(error)
  }
})

async function deletePost(authToken, _id, imageKey) {
  try {
    const deleteImageRes = await deleteUserImage(imageKey, authToken)
    const deletePostRes = await postsCollection.deleteOne({ "_id": new ObjectId(_id) })
    return (deletePostRes)
  }
  catch (error) {
    throw (error)
  }
}

async function deleteUserImage(imageKey, authToken) {

  try {
    const userResult = await usersCollection.findOne({ "authToken": authToken })
    if (userResult.userImageKeys.includes(imageKey)) {
      const pullKeyResult = await usersCollection.updateOne({ "authToken": authToken }, { $pull: { "userImageKeys": imageKey } })
      const deleteResult = await deleteUserImageFromAWS(imageKey)
      return ("success")
    }
    else {
      throw ("wrong user!")
    }
  }
  catch (error) {
    console.log(error)
    throw (error)
  }
}

function deleteUserImageFromAWS(imageKey) {
  return new Promise((resolve, reject) => {
    s3Client.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: "userimages/" + imageKey
    }).promise().then(
      result => {
        resolve(result)
      }
    ).catch(error => {
      reject(error)
    })
  })
}



app.get("/api/like_post", (req, res) => {
  //console.log('ran like post', req.query)
  var _id = new ObjectId(req.query._id)
  var userID = new ObjectId(req.query.userID)

  postsCollection.findOne({ "_id": _id })
    .then(post => {
      //console.log("found post", post)
      var usersWhoLiked = post.usersWhoLiked.map(x => x.toString())
      //console.log("users who liked", usersWhoLiked, userID)

      if (usersWhoLiked.includes(userID.toString())) {
        //console.log("user already liked", usersWhoLiked)
        var indexOfUserID = usersWhoLiked.indexOf(userID)
        usersWhoLiked.splice(indexOfUserID, 1)
        //console.log("unlike", usersWhoLiked, indexOfUserID)
        var usersAsObjectId = usersWhoLiked.map(x => new ObjectId(x))
        postsCollection.updateOne({ "_id": post._id }, { $set: { "usersWhoLiked": usersAsObjectId } })
          .then(result => {
            res.status(200).send("unliked successfully")
          })
          .catch(error => {
            res.status(500).send(error)
          })
      }
      else {
        //console.log("user didn't liked", usersWhoLiked, userID)

        usersWhoLiked.push(userID.toString())

        var usersAsObjectId = usersWhoLiked.map(x => new ObjectId(x))

        postsCollection.updateOne({ "_id": post._id }, { $set: { "usersWhoLiked": usersAsObjectId } }).then(result => {
          res.status(200).send("liked successfully")
        })
          .catch(error => {
            res.status(500).send(error)
          })
      }

    })
    .catch(error => {
      res.status(500).send(error)
    })

})

app.get("/api/get_timeline", async (req, res) => {
  //console.log("/api/get_timeline")
  /* 1. find user
  2. find user's friends
  3. gather friends post for today and yesterday and tmw
  2. check if user posted already
  4. if user didn't post, don't deliver timeline
  5. if did post, then deliver TL sorted by time posted
  */

  //unix time in 24 hours: 86400
  const authToken = req.query.authToken
  const phoneNumber = req.query.phoneNumber

  try {
    //console.log("trying")
    const { friends, _id } = await verifyToken(authToken, phoneNumber)
    //console.log("friends", friends)
    var timelinePosts = []
    var friendIDs = []
    for (var x = 0; x < friends.length; x++) {
      //console.log("friends x", friends[x])
      friendIDs.push(friends[x])
    }
    friendIDs.push(_id)

    if (friendIDs.length > 0) {
      timelinePosts = await postsCollection.find({ userID: { $in: friendIDs } }).sort("timeStamp", -1).limit(10).toArray()
    }
    //console.log("posts", timelinePosts)
    res.status(200).send(timelinePosts)
  }
  catch (error) {
    res.status(500).send(error)
  }
})

app.get("/api/get_user_by_auth_token", (req, res) => {
  //console.log("ran get user by auth", req.query)
  var phoneNumber = req.query.phoneNumber
  usersCollection.findOne(
    { "authToken": req.query.authToken })
    .then(user => {
      //console.log("testing get user", user)
      if (user != null) {
        res.status(200).send(user)
      }
      else {
        res.status(500).send("error invalid auth token")
      }

    })
    .catch(error => {
      //console.log(error)
      res.status(500).send("error finding user")
    })
})

app.get("/api/get_user_by_id", (req, res) => {
  //console.log("ran get user", req.query)
  usersCollection.findOne(
    { "_id": new ObjectId(req.query._id) },
    { projection: { username: 1, userPfp: 1, timeCreated: 1 } }
  )
    .then(user => {
      //console.log("user found in get user", user)
      res.status(200).send(user)
    })
    .catch(error => {
      //console.log(error)
      res.status(500).send("error finding user")
    })
})

app.get("/api/get_user_posts", (req, res) => {
  var userID = req.query.userID
  var timeline = []
  try {
    postsCollection.find({
      "userID": new ObjectId(userID),
    }).limit(10)
      .sort({ "timeStamp": -1 })
      .toArray((error, result) => {
        //console.log("result from toArray", result)
        if (error) {
          res.status(500).send("error getting profile")
        }
        for (var i = 0; i < result.length; i++) {
          timeline.push(result[i])
        }
        res.status(200).send(timeline)
      })

  }
  catch (error) {
    res.status(500).send(error)
  }
})


app.post("/api/update_profile_picture", upload.single("pfp"), async (req, res) => {
  const authToken = req.query.authToken
  const imageKey = req.query.imageKey
  //console.log("update profile picture")


  try {
    var currentUser = await usersCollection.findOne({ "authToken": authToken }, { projection: { "userPfp": 1 } })
    var currentPfp = currentUser.userPfp.substring(currentUser.userPfp.lastIndexOf("/") + 1, currentUser.userPfp.length)
    //console.log("userpfp", currentPfp)
    const deleteOld = await deleteProfilePictureFromAWS(currentPfp)
    const updateRes = await usersCollection.updateOne({ "_id": currentUser._id },
      { $set: { userPfp: process.env.CLOUDFRONT_DIST_URL + "/pfp/" + imageKey } })
    res.status(200).send({ userPfp: process.env.CLOUDFRONT_DIST_URL + "/pfp/" + imageKey })
  }
  catch (error) {
    //console.log(error)
    res.status(500).send(error)
  }

})

app.post("/api/upload_pfp", upload.single("pfp"), (req, res) => {
  //console.log("upload profile picture")
  res.status(200).send("file upload succes")
})

app.post("/api/upload_user_image", uploadUserImage.single("user_image"), (req, res) => {
  //console.log("upload user image params", req.query)
  usersCollection.findOne({ "authToken": req.query.authToken }).then(user => {
    if (user) {
      usersCollection.updateOne({ "authToken": req.query.authToken }, { $push: { "userImageKeys": req.query.imageKey } })
        .then(result => {
          res.status(200).send(result)
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
    else {
      res.status(500).send("")
    }
  })
    .catch(error => {
      res.status(500).send(error)
    })
})


app.get("/api/get_time_of_last_post", (req, res) => {
  //console.log("get time of last post")
  const userID = req.query.userID
  postsCollection.findOne({ "userID": new ObjectId(userID) }, { projection: { "timeStamp": 1 } })
    .then(result => {
      if (result) {
        //console.log()
        res.status(200).send(result)
      }
      else {
        res.status(200).send({ "timeStamp": 0 })
      }
    })
    .catch(error => {
      //console.log(error)

      res.status(500).send(error)
    })
})

async function makePost(authToken, userID, imageKey, description, timeStamp) {


}

app.get("/api/make_post", async (req, res) => {

  var authToken = req.query.authToken
  var userID = req.query.userID
  var imageKey = req.query.imageKey
  var description = req.query.description
  var timeStamp = Math.round(new Date().getTime() / 1000)


  usersCollection.findOne({ "authToken": authToken })
    .then(user => {
      //user is valid
      postsCollection.insertOne({
        userID: new ObjectId(userID),
        postType: "image",
        imgUrl: process.env.CLOUDFRONT_DIST_URL + "/userimages/" + imageKey,
        textContent: description,
        commentsID: new ObjectId(),
        usersWhoLiked: [],
        timeStamp: timeStamp
      }).then(result => {
        res.status(200).send(result)
      })
        .catch(error => {
          //console.log("error making post", error)
        })

    })
    .catch(error => {
      //console.log("error finding user", error)
      res.status(500).send("error validating user")
    })
})

app.get("/api/finish_signup", (req, res) => {
  var authToken = req.query.authToken
  var username = req.query.username
  var userPfp = req.query.userPfp

  //Check if the username already exists:
  usersCollection.find({ "username": username })
    .toArray((error, result) => {
      if (result.length > 0) {
        //username already exists!
        res.status(500).send("username taken")
      }
      else {
        usersCollection.updateOne({ "authToken": authToken }, {
          $set: {
            username: username,
            userPfp: userPfp
          }
        })
          .then(user => {
            //console.log("user finished sign up", user)
            res.status(200).send(user)
          })
          .catch(error => {
            //console.log("failed to finish sign up", error)
            res.status(500).send(error)
          })
      }
      if (error) {
        res.status(500).send(error)
      }
    })

})

async function verifyToken(authToken, phoneNumber) {
  //console.log("ran verify token")
  try {
    const user = await usersCollection.findOne({ "authToken": authToken })

    //console.log("found user by token ", user)
    //check if the user's local phone number matches the token they searched for
    if (user.phoneNumber === phoneNumber) {
      // res.status(200).send("auth is good!")
      //console.log("found user and phone matched")
      return (user)
    }

    else {
      throw ("")
    }
  }
  catch (error) {
    throw (error)
  }

}


app.listen(port, () => {
  //console.log(`[server]: Server is running at https://localhost:${port}`);
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "..", 'build')));
    app.use(cors())
    //console.log("running in production")
    app.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, "..", 'build', 'index.html'));
    });
  }
});


function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}