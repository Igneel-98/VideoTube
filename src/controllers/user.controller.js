import { asyncHandler } from "../utils/asyncHandler.js";
import { Users } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../services/cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {

    // getting user details
    const {username, email, fullName, password} = req.body
    // console.log(req.body);
    // console.log(req.body.username.toLowerCase());
    
    // validation - not empty
    if(
        [username, email, fullName, password].some((field) => {
            return field?.trim() === ""
        })
    ){
        throw new ApiError(400, "All fields are required.")
    }

    // check if user exists already
    const existedUser = await Users.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User with this username or email already exists")
    }

    // check for avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLoaclPath = req.files?.coverImage[0]?.path

    // console.log(avatarLocalPath);
    // console.log(coverImageLoaclPath);
    
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required.")
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    

    let coverImage
    if(coverImageLoaclPath){
        coverImage = await uploadOnCloudinary(coverImageLoaclPath)
    }
    if(!avatar){
        throw new ApiError(500, "Something went wrong while uploading avatar.")
    }

    // console.log("AVATAR: " + avatar.url);
    // console.log("COVER: "+ coverImage.url);
    

    // create user object
    const user = await Users.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // remove password and refreshToken from response
    const createdUser = await Users.findById(user._id).select("-password -refreshToken")

    // check created user
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user.")
    }

    // response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully.")
    )
})

export { registerUser }