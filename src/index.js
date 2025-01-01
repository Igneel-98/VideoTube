import connectDB from "./db/index.js";
import {} from "dotenv/config";
import { app } from "./app.js"


connectDB()
.then( () => {
    app.on( "error", (error) => {
        console.log(`ERRORS : ${error}`);
        throw error        
    })
    app.listen( process.env.PORT, () => {
        console.log(`⚙️  Server running on http://localhost:${process.env.PORT}`);
    })
})
.catch( (error) => {
    console.log(`⚠️ MONGODB CONNECTION FAILED !! : ${error}`);
    
})