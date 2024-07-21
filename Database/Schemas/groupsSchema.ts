import { Model, model, Schema } from "mongoose";
import { IGroups } from "../../Models/IGroups";


const groupsSchema:Schema= new Schema<IGroups>({
    group_name:{type:String, requird:true},
    created_by: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    is_active:{type:Boolean},
    description:{type:String},

},{timestamps:true});

const GroupsTable:Model<IGroups>= model<IGroups>('group',groupsSchema);
export default GroupsTable;