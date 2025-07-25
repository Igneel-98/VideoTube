import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { readFile } from 'fs/promises';

const app = express()

import swaggerUi from "swagger-ui-express";
const swaggerDocument = JSON.parse(await readFile('./src/docs/generated/swagger-output.json', 'utf-8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VideoTube API Documentation'
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import healthcheckRouter from "./routes/healthcheck.route.js"
import userRouter from "./routes/user.route.js";
import tweetRouter from "./routes/tweet.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export { app }
