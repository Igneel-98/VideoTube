import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken,
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails 
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()


router.route("/register").post(
    // #swagger.tags = ['auth']
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser
)


router.route("/login").post(
    loginUser 
    // #swagger.tags = ['auth']
)  

//secured routes

router.route("/logout").post(
    // #swagger.tags = ['auth']
    verifyJWT,  
    logoutUser
)

router.route("/refresh-token").post(
    refreshAccessToken
    // #swagger.tags = ['auth']
)

router.route("/change-password").post(
    // #swagger.tags = ['auth']
    verifyJWT, 
    changeCurrentPassword
)

router.route("/current-user").get(
    // #swagger.tags = ['profile']
    verifyJWT, 
    getCurrentUser
)

router.route("/update-account").patch(
    // #swagger.tags = ['profile']
    verifyJWT, 
    updateAccountDetails
)

router.route("/update-avatar").patch(
    // #swagger.tags = ['profile']
    verifyJWT, 
    upload.single("avatar"), 
    updateUserAvatar
)
router.route("/update-cover-image").patch(
    // #swagger.tags = ['profile']
    verifyJWT, 
    upload.single("coverImage"), 
    updateUserCoverImage
)

router.route("/c/:username").get(
    // #swagger.tags = ['channel']
    verifyJWT, 
    getUserChannelProfile
)
router.route("/history").get(
    // #swagger.tags = ['profile']
    verifyJWT, 
    getWatchHistory
)

export default router