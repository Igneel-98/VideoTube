import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId")
    .post(
            // #swagger.tags = ['subscriptions'] 
            toggleSubscription
        )
    .get(
        // #swagger.tags = ['subscriptions'] 
        getSubscribedChannels
    );    

router.route("/u/:subscriberId").get(
    // #swagger.tags = ['subscriptions'] 
    getUserChannelSubscribers
);

export default router