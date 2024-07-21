import { Model, model, Schema } from "mongoose";
import { IUser } from "../../Models/IUser";


const userSchema:Schema= new Schema<IUser>({
    name:{type:String, requird:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    created_by: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    avatarImg:{type:String, required:true},
    isAdmin:{type:Boolean, required:true}
},{timestamps:true});

const User:Model<IUser>= model<IUser>('users',userSchema);
export default User;