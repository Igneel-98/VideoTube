import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelIdentifier: channelId} = req.params
    
    // validate channelID
    let channel;
    if(isValidObjectId(channelIdentifier)){
        channel = await User.findById(channelIdentifier);
    }
    else{
        channel = await User.findOne({ username: channelIdentifier});
    }

    if(!channel){
        throw new ApiError(404, "Channel Not Found");
    }

    // check if user trying to subscribe itself
    if(req.user?._id.toString() === channel._id.toString()){
        throw new ApiError(400, "Cannot subscribe to yourself");
    }

    // toggle subscription
    const existingSubscription = await Subscription.findOne({
        subscriber  : req.user._id,
        channel : channel._id

    })

    if(existingSubscription){
        // Unsubscribe
        const unsubscribe = await Subscription.deleteOne({
            _id : existingSubscription._id
        })
        if (unsubscribe.deletedCount === 0) {
            throw new ApiError(500, "Unable to unsubscribe");
        }


        return res.status(200).json(
            200, unsubscribe, "Channel Unsubscribed Successfully"
        )
    }
    else{
        // Subscribe
        const subscribe = await Subscription.create({
            subscriber : req.user._id,
            channel : channel._id
        })
        
        return res.status(200).json(
            200, subscribe, "Channel Subscribed Successfully"
        )

    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}