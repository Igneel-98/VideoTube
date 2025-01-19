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
    
    let coverImageLocalPath;
    if (req.files?.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // console.log(avatarLocalPath);
    // console.log(coverImageLoaclPath);
    
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required.")
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    let coverImage
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
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

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = Users.findById(userId)
    
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and Access Tokens.")
    }
}

const loginUser = asyncHandler( async (req, res) => {
    
    // 1. getting data
    const { email, username, password} = req.body

    // 2. check username or email
    if( !(email || username) ){
        throw new ApiError(400, "Username or Email is required.")
    }

    // 3. find the user 
    const user = await Users.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist.")
    }

    // check password
    if( !password ){
        throw new ApiError(400, "Password is required.")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials.")
    }

    // Access Token and Refresh Token
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

    // send cookie
    const loggedInUser = await Users.findById(user._id).select("-password -refreshToken")

    const options = {
        httponly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "User LoggedIn Successfully."
        )
    )
})

export { registerUser, loginUser }