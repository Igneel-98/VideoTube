import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // Extract content from request body
    const { content } = req.body;

    // Validate tweet
    if(!content || content.trim() == ""){
        throw new ApiError(400, "Tweet content is required.");
    }

    // Check content length
    if(content.length > 300){
        throw new ApiError(400, "Tweet length cannot exceed 300 characters.");
    }

    // Check auth (from auth middleware)
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401, "User Authentication required.");
    }

    // Create tweet
    const tweet = await Tweet.create({
        content : content.trim(),
        owner : userId
    })

    // check tweet
    if(!tweet){
        throw new ApiError(400, "Issue creating tweet. Try Again");
    }

    // populate owner details
    const populatedTweet = await Tweet.findById(tweet._id).populate("owner", "username fullName avatar");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                populatedTweet,
                "Tweet created successfully"
            )
        );
})

const getUserTweets = asyncHandler(async (req, res) => {
    // extract userIdentifier from params 
    const { userIdentifier } = req.params;

    // determine if its username or userID
    let user;
    if(isValidObjectId(userIdentifier)){
        user = await User.findById(userIdentifier);
    }
    else{
        user = await User.findOne({ username : userIdentifier});
    }

    // check if user exists
    if(!user){
        throw new ApiError(404, "User not found");
    }

    // get the pagination 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // validate pagination
    if(page < 1 || limit < 1 || limit > 100){
        throw new ApiError(400, "Invalid pagination parameters")
    }

    // fetch tweets 
    const tweet = await Tweet.findOne({owner : user._id})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)

    // total tweets
    const totalTweets = await Tweet.countDocuments({ owner: user._id});

    // prepare response
    const responseData = {
        tweets,
        userInfo: {
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar
        },
        pagination: {
            currentPage: page,
            totalPages,
            totalTweets,
            tweetsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, `${totalTweets} tweets found for user ${user.username}`)
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    // Extract content from request body
    const { content } = req.body;
    const { tweetId } = req.params;

    // Validate tweet
    if(!content || content.trim() == ""){
        throw new ApiError(400, "Tweet content is required.");
    }

    // Check content length
    if(content.length > 300){
        throw new ApiError(400, "Tweet length cannot exceed 300 characters.");
    }

    // Check auth (from auth middleware)
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401, "User Authentication required.");
    }

    // Find the tweet first
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    // Check if current user owns this tweet
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet.");
    }

    // update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content: content.trim() },
        { new: true }
    ).populate("owner", "username fullName avatar");

    // check update
    if(!updatedTweet){
        throw new ApiError(400, "Tweet Update Failed");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "Tweet updated successfully"
            )
        );
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    // Check auth (from auth middleware)

    if(!userId){
        throw new ApiError(401, "User Authentication required.");
    }

    // Find the tweet first
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    // Check if current user owns this tweet
    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet.");
    }

    // delete tweet
    const tweetDeleted = await Tweet.deleteOne(tweetId);
    if(!tweetDeleted){
        throw new ApiError(400, "Tweet deletion failed")
    }

    // response
    return res.status(200).json(
        new ApiResponse(200, deleteTweet,"Tweet deleted successfully") 
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}