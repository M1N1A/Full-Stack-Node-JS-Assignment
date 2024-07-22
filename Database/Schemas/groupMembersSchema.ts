import { Model, model, Schema } from "mongoose";
import { IGroupMembers } from "../../Models/IGroupMembers";


const groupMembersSchema:Schema= new Schema<IGroupMembers>({
    group_id:{type: Schema.Types.ObjectId, ref: 'group', required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    members:{type: Schema.Types.ObjectId, ref: 'users', required: true},

},{timestamps:true});

const GroupsMembersTable:Model<IGroupMembers>= model<IGroupMembers>('group-members',groupMembersSchema);
export default GroupsMembersTable;