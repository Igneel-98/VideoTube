import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(
    // #swagger.tags = ['tweets']    
    createTweet
);
router.route("/user/:userId").get(
    // #swagger.tags = ['tweets'] 
    getUserTweets
);
router.route("/:tweetId").patch(
    // #swagger.tags = ['tweets'] 
    updateTweet
).delete(
    // #swagger.tags = ['tweets'] 
    deleteTweet
);

export default router