import express, { Application, Request, Response } from "express";
import dotnev from "dotenv";
import { dbConnection } from "./Database/Connection/dbConnection";
import cors from "cors";
import AddUsersRouters from "./Routers/AdminRouters/AddUsersRouters";
import LoginRouters from "./Routers/LoginRouters/LoginRouters";
import groupRouter from "./Routers/UserRouters/groupRouter";
import messageRouter from "./Routers/UserRouters/MessageRouter";


const mongoose = require('mongoose');
const app:Application = express();

dotnev.config({
    path:"./.env"
})

mongoose.set('strictQuery', true);

app.use(express.json());

const port:number | undefined = Number(process.env.PORT)||9898;
const hostname:string | undefined = "127.0.0.1";

//Db Configuration
const dbUrl:string | undefined = process.env.MONGO_DB_URL;
const dbName:string | undefined = process.env.DATA_BASE_NAME;



if(dbUrl && dbName){
    dbConnection.connectToDB(dbUrl,dbName).then((response)=>{
        console.log(response);
    }).catch((err)=>{
        console.log(err);
    })
}

app.get("/",(request:Request, response:Response)=>{
    response.status(200);
    response.json({
        msg:"Welcome TO Express Server"
    })
})

app.use(cors());
app.use("/api/users", AddUsersRouters);
app.use("/api/login", LoginRouters);
app.use("/api/groups", groupRouter);
app.use("/api/message", messageRouter);

if(port){
    app.listen(port,()=>{
        console.log(`Express Js Server Started http://${hostname}:${port}`);
    })
}
