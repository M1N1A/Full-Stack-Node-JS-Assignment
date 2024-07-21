// import mongoose from "mongoose"
import mongoose from "mongoose";

export class dbConnection{
    public static connectToDB(dbUrl:string, dbName:string):Promise<any>{
        return new Promise((resolve, reject)=>{
            mongoose.connect(dbUrl,{
                dbName:dbName
            }).then(()=>{
                resolve("Mongo DB Connection Successfull");
            }).catch((err)=>{
                process.exit(0);
                reject(err);
            })
        })
    }
}