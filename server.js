import express from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from 'cors'
import cookieParser from "cookie-parser";
import router from "./routes/userRoute.js";

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({
    useTempFiles: true
}))

//connect mongodb

// link lien ket mongodb
const mongo_url = "mongodb+srv://admin:admin@cluster0.0q55c.mongodb.net/freshfood?retryWrites=true&w=majority"
    //cau lenh ket noi
mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err
    console.log("Connected to MongoDB")
})

app.use('/user', router)

const PORT = 5000
app.listen(PORT, () => console.log(`Server is listening on port : ${PORT}`))