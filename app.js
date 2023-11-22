// const express = require("express");
// const { open } = require("sqlite");
// const path = require("path");
// const sqlite3 = require("sqlite3");

// const app = express();
// app.use(express.json());

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const dbPath = path.join(__dirname, "twitterClone.db");
// let db = null;

// const initializeDbAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("Server Running at http://localhost:3000");
//     });
//   } catch (e) {
//     console.log(`DB Error: ${e.message}`);
//     process.exit(1);
//   }
// };

// initializeDbAndServer();

// //JwtToken Verification
// const authenticationToken = (request, response, next) => {
//     const { tweet } = request.body;
//     const { tweetId } = request.params;
//     let jwtToken;
//     const authHeader = request.headers["authorization"];
//     if (authHeader !== undefined){
//         jwtToken = authHeader.split(" ")[1];
//     }
//     if (jwtToken === undefined){
//         response.status(401);
//         response.send("Invalid JWT Token");
//     } else {
//         jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
//             if (error){
//                 response.status(401);
//                 response.send("Invalid JWT Token");
//             } else {
//                 request.payload = payload;
//                 request.tweetId = tweetId;
//                 request.tweet = tweet;
//                 next();
//             }
//         });
//     }
// };

// //Register User API-1
// app.post("/register", async (request, response) => {
//     const {username, password, name, gender} = request.body;
//     const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
//     const dbUser await db.get(selectUserQuery);
//     if (dbUser === undefined){
//         if (password.length < 6){
//             response.status(400);
//             response.send("Password is too short");
//         } else {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             const createUserQuery = `
//                 INSERT INTO
//                     user (name, username, password, gender)
//                 VALUES(
//                     '${name}', '${username}', '${hashedPassword}', '${gender}'
//                 )
//             ;`;
//             await db.run(createUserQuery);
//             response.status(200);
//             response.send("User created successfully");
//         }
//     } else {
//         response.status(400);
//         response.send("User already exists");
//     }
// });

// //User Login API-2
// app.post("/login", async (request, response) => {
//     const {username, password} = request.body;
//     const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
//     const dbUser = await db.get(selectUserQuery);
//     if (dbUser === undefined){
//         response.status(400)
//         response.send("Invalid user");
//     } else {
//         const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
//         if (isPasswordMatched === true){
//             const jwtToken = jwt.sign(dbUser, "MY_SECRET_TOKEN");
//             response.send({jwtToken});
//         } else {
//             response.status(400);
//             response.send("Invalid password");
//         }
//     }
// });

// //User Tweets Feed API-3
// app.get("/user/tweets/feed", authenticationToken, async (request, response) => {
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const getTweetsFeedQuery = `
//         SELECT
//             username, tweet, date_time AS dateTime
//         FROM
//             follower INNER JOIN tweet ON follower.following_user_id = tweet.user_id INNER JOIN user ON user.user_id = follower.following_user_id
//         WHERE
//             follower.follower_user_id = ${user_id}
//         ORDER By
//             date_time DESC
//         LIMIT 4
//     ;`;
//     const tweetFeedArray = await db.all(getTweetsFeedQuery);
//     response.send(tweetFeedArray);
// });

// //Get User Following User Names Api-4
// app.get("/user/following" authenticationToken, async (request, response) => {
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const userFollowsQuery = `
//         SELECT
//             name
//         FROM
//             user INNER JOIN follower ON user.user_id = follower.following_user_id
//         WHERE
//             follower.follower_user_id = ${user_id}
//     ;`;
//     const userFollowsArray = await db.all(userFollowsQuery);
//     response.send(userFollowsArray);
// });

// //Get User Names Followers API-5
// app.get("/user/followers", authenticationToken, async (request, response) => {
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const userFollowersQuery = `
//         SELECT
//             name
//         FROM
//             user INNER JOIN follower ON user.user_id = follower.follower_user_id
//         WHERE
//             follower.following_user_id = ${user_id}
//     ;`;
//     const userFollowersArray = await db.all(userFollowersQuery);
//     response.send(userFollowersArray);
// });

// //Get Tweet API-6
// app.get("/tweets/:tweetId", authenticationToken, async (request, response) => {
//     const {tweetId} = request;
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const tweetsQuery = `SELECT * FROM tweet WHERE tweet_id=${tweetId};`;
//     const tweetsResult = await db.get(tweetsQuery);

//     const userFollowersQuery = `
//         SELECT *
//         FROM follower INNER JOIN user ON user.user_id = follower.following_user_id
//         WHERE
//             follower.follower_user_id = ${user_id}
//     ;`;
//     const userFollowers = await db.all(userFollowersQuery);

//     if (
//         userFollowers.some(
//             (item) => item.following_user_id === tweetsResult.user_id
//         )
//     ) {
//         const getTweetDetailsQuery = `
//             SELECT
//                 tweet,
//                 COUNT(DISTINCT(like.like_id)) AS likes,
//                 COUNT(DISTINCT(reply.reply_id)) AS replies,
//                 tweet.date_time AS dateTime
//             FROM
//                 tweet INNER JOIN like ON tweet.tweet_id = like.tweet_id INNER JOIN reply ON reply.tweet_id = tweet.tweet_id
//             WHERE
//                 tweet.tweet_id = ${tweetId} AND tweet.user_id = ${userFollowers[0].user_id}
//         ;`;
//         const tweetDetails = await db.get(getTweetDetailsQuery);
//         response.send(tweetDetails);
//     } else {
//         response.status(401);
//         response.send("Invalid Request");
//     }
// });

// //Get Tweet Liked Users APi-7
// app.get("/tweets/:tweetId/likes", authenticationToken, async (request, response) => {
//     const {tweetId} = request;
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const getLikedUsersQuery = `
//         SELECT *
//         FROM
//             follower INNER JOIN tweet ON tweet.user_id = follower.following_user_id INNER JOIN like ON like.tweet_id = tweet.tweet_id
//         WHERE
//             tweet.tweet_id = ${tweetId} AND follower.follower_user_id = ${user_id}
//     ;`;
//     const likedUsers = await db.all(getLikedUsersQuery);

//     if (likedUsers.length !== 0){
//         let likes = [];
//         const getNamesArray = (likedUsers) => {
//             for (let item of likedUsers){
//                 likes.push(item.username);
//             }
//         };
//         getNamesArray(likedUsers);
//         response.send({likes});
//     } else {
//         response.status(401);
//         response.send("Invalid Request");
//     }
// });

// //Get Tweet Replied Users API-8
// app.get("/tweets/:tweetId/replies", authenticationToken, async (request, response) => {
//     const {tweetId} = request;
//     const {payload } = request;
//     const {user_id, name, username, gender} = payload;
//     const getRepliedUsersQuery = `
//         SELECT *
//         FROM
//             follower INNER JOIN tweet ON tweet.user_id = follower.following_user_id INNER JOIN reply ON reply.tweet_id = tweet.tweet_id
//             INNER JOIN user ON user.user_id = reply.user_id
//         WHERE
//             tweet.tweet_id = ${tweetId} AND follower.follower_user_id = ${user_id}
//     ;`;
//     const repliedUsers = await db.all(getRepliedUsersQuery);
//     if (repliedUsers.length !== 0){
//         let replies = [];
//         const getNamesArray = (repliedUsers) => {
//             for (let item of repliedUsers){
//                 let object = {
//                     name: item.name,
//                     reply: item.reply,
//                 };
//                 replies.push(object);
//             }
//         };
//         getNamesArray(repliedUsers);
//         response.send({replies});
//     } else {
//         response.status(401);
//         response.send("Invalid Request");
//     }
// });

// //Get All Tweet of User API-9
// app.get("/user/tweets", authenticationToken, async(request, response) => {
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const getTweetsDetailsQuery = `
//         SELECT
//             tweet.tweet AS tweet,
//             COUNT(DISTINCT(like.like_id)) AS likes,
//             COUNT(DISTINCT(reply.reply_id)) AS replies,
//             tweet.date_time AS dateTime
//         FROM
//             user INNER JOIN tweet ON user.user_id = tweet.user_id INNER JOIN like ON like.tweet_id = tweet.tweet_id INNER JOIN reply ON reply.tweet_id = tweet.tweet_id
//         WHERE
//             user.user_id = ${user_id}
//         GROUP BY
//             tweet.tweet_id
//     ;`;
//     const tweetsDetails = await db.all(getTweetsDetailsQuery);
//     response.send(tweetsDetails);
// });

// //Get Post Tweet API-10
// app.post("/user/tweets", authenticationToken, async(request, response) => {
//     const {tweet} = request;
//     const {tweetId} = request;
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const postTweetQuery = `
//         INSERT INTO
//             tweet (tweet, user_id)
//         VALUES(
//             '${tweet}', ${user_id}
//         )
//     ;`;
//     await db.run(postTweetQuery);
//     response.send("Created a Tweet");
// });

// //Delete Tweet API-11
// app.delete("/tweets/:tweetId", authenticationToken, async(request, response) => {
//     const {tweetId} = request;
//     const {payload} = request;
//     const {user_id, name, username, gender} = payload;
//     const selectUserQuery = `SELECT * FROM tweet WHERE tweet.user_id = ${user_id} AND tweet.tweet_id =${tweetId}`
//     const tweetUser = await db.all(selectUserQuery);
//     if (tweetUser.length !== 0){
//         const deleteTweetQuery = `
//             DELETE FROM tweet
//             WHERE
//                 tweet.user_id = ${user_id} AND tweet.tweet_id = ${tweetId}
//         ;`;
//         await db.run(deleteTweetQuery);
//         response.send("Tweet Removed");
//     } else {
//         response.status(401);
//         response.send("Invalid Request");
//     }
// });

// module.exports = app;

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "twitterClone.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Getting User Following People Id's

const getFollowingPeopleIdsOfUser = async (username) => {
  const getTheFollowingPeopleQuery = `
        SELECT 
            following_user_id
        FROM
            follower
        INNER JOIN user ON user.user_id = follower.follower_user_id
        WHERE user.username='${username}';
    `;
  const followingPeople = await db.all(getTheFollowingPeopleQuery);
  const arrayOfIds = followingPeople.map(
    (eachUser) => eachUser.following_user_id
  );
  return arrayOfIds;
};

// Authentication Token
const authentication = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken) {
    jwt.verify(jwtToken, "SECRET_KEY", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        request.userId = payload.userId;
        next();
      }
    });
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
};

// Tweet Access Verification
const tweetAccessVerification = async (request, response, next) => {
  const { userId } = request;
  const { tweetId } = request.params;
  const getTweetQuery = `
        SELECT * 
        FROM 
            tweet 
        INNER JOIN follower ON tweet.user_id = follower.following_user_id
        WHERE 
            tweet.tweet_id = '${tweetId}' AND follower_user_id = '${userId}';
    `;
  const tweet = await db.get(getTweetQuery);
  if (tweet === undefined) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    next();
  }
};

//API-1
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const getUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const userDbDetails = await db.get(getUserQuery);

  if (userDbDetails !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createUserQuery = `
                INSERT INTO user (username, password, name, gender)
                VALUES(
                    '${username}', '${hashedPassword}', '${name}', '${gender}'
                )
            `;
      await db.run(createUserQuery);
      response.send("User created successfully");
    }
  }
});

//API-2
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const getUserQuery = `
        SELECT * FROM user WHERE username='${username}';
    `;
  const userDbDetails = await db.get(getUserQuery);
  if (userDbDetails !== undefined) {
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userDbDetails.password
    );
    if (isPasswordCorrect) {
      const payLoad = { username, userId: userDbDetails.user_id };
      const jwtToken = jwt.sign(payLoad, "SECRET_KEY");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

//API-3
app.get("/user/tweets/feed/", authentication, async (request, response) => {
  const { username } = request;

  const followingPeopleIds = await getFollowingPeopleIdsOfUser(username);

  const getTweetsQuery = `
        SELECT username,tweet,date_time AS dateTime
        FROM
            user INNER JOIN tweet ON user.user_id = tweet.user_id
        WHERE
            user.user_id IN (${followingPeopleIds})
        ORDER BY dateTime DESC
        LIMIT 4;
    `;
  const tweets = await db.all(getTweetsQuery);
  response.send(tweets);
});

//API-4
app.get("/user/following/", authentication, async (request, response) => {
  const { username, userId } = request;
  const getFollowingUsersQuery = `
        SELECT name 
        FROM 
            follower INNER JOIN user ON user.user_id = follower.following_user_id
        WHERE follower_user_id = '${userId}';
    `;
  const followingPeople = await db.all(getFollowingUsersQuery);
  response.send(followingPeople);
});

//API-5
app.get("/user/followers/", authentication, async (request, response) => {
  const { username, userId } = request;
  const getFollowersQuery = `
        SELECT DISTINCT name 
        FROM 
            follower INNER JOIN user ON user.user_id = follower.follower_user_id
        WHERE following_user_id = '${userId}';
    `;
  const followers = await db.all(getFollowersQuery);
  response.send(followers);
});

//API-6
app.get(
  "/tweets/:tweetId/",
  authentication,
  tweetAccessVerification,
  async (request, response) => {
    const { username, userId } = request;
    const { tweetId } = request.params;
    const getTweetQuery = `
        SELECT tweet, 
        (SELECT COUNT() FROM like WHERE tweet_id = '${tweetId}') AS likes,
        (SELECT COUNT() FROM reply WHERE tweet_id = '${tweetId}') AS replies,
        date_time AS dateTime
        FROM tweet
        WHERE tweet.tweet_id = '${tweetId}';
    `;
    const tweet = await db.get(getTweetQuery);
    response.send(tweet);
  }
);

//API-7
app.get(
  "/tweets/:tweetId/likes/",
  authentication,
  tweetAccessVerification,
  async (request, response) => {
    const { tweetId } = request.params;
    const getLikesQuery = `
        SELECT username
        FROM 
            user INNER JOIN like ON user.user_id = like.user_id
        WHERE tweet_id = '${tweetId}';
    `;
    const likedUsers = await db.all(getLikesQuery);
    const usersArray = likedUsers.map((eachUser) => eachUser.username);
    response.send({ likes: usersArray });
  }
);

//API-8
app.get(
  "/tweets/:tweetId/replies/",
  authentication,
  tweetAccessVerification,
  async (request, response) => {
    const { tweetId } = request.params;
    const getRepliedQuery = `
        SELECT name,reply
        FROM 
            user INNER JOIN reply ON user.user_id = reply.user_id
        WHERE tweet_id = '${tweetId}';
    `;
    const repliedUsers = await db.all(getRepliedQuery);
    response.send({ replies: repliedUsers });
  }
);

//API-9
app.get("/user/tweets/", authentication, async (request, response) => {
  const { userId } = request;
  const getTweetsQuery = `
        SELECT tweet,
            COUNT(DISTINCT like_id) AS likes,
            COUNT(DISTINCT reply_id) AS replies,
            date_time AS dateTime
            FROM 
                tweet LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
                LEFT JOIN like ON tweet.tweet_id = like.tweet_id
        WHERE tweet.user_id = ${userId}
        GROUP BY tweet.tweet_id;
    `;
  const tweets = await db.all(getTweetsQuery);
  response.send(tweets);
});

//API-10
app.post("/user/tweets/", authentication, async (request, response) => {
  const { tweet } = request.body;
  const userId = parseInt(request.userId);
  const dateTime = new Date().toJSON().substring(0, 19).replace("T", " ");
  const createTweetQuery = `
        INSERT INTO tweet(tweet, user_id, date_time)
        VALUES(
            '${tweet}', '${userId}', '${dateTime}'
        )
    `;
  await db.run(createTweetQuery);
  response.send("Created a Tweet");
});

//API-11
app.delete("/tweets/:tweetId/", authentication, async (request, response) => {
  const { tweetId } = request.params;
  const { userId } = request;
  const getTheTweetQuery = `
        SELECT * FROM tweet WHERE user_id = '${userId}' AND tweet_id = '${tweetId}';
    `;
  const tweet = await db.get(getTheTweetQuery);
  if (tweet === undefined) {
    response.status(401);
    response.send("Invalid Request");
  } else {
    const deleteTweetQuery = `DELETE FROM tweet WHERE tweet_id = '${tweetId}';`;
    await db.run(deleteTweetQuery);
    response.send("Tweet Removed");
  }
});

module.exports = app;
