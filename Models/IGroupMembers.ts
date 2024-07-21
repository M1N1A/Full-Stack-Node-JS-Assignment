import {Schema} from 'mongoose';

export interface IGroupMembers {
    _id?: string;
    group_id: Schema.Types.ObjectId;
    created_by: Schema.Types.ObjectId;
    members: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}