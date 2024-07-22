import {Schema} from 'mongoose';

export interface IGroupMessage {
    _id?: string;
    message: string;
    send_by: Schema.Types.ObjectId;
    like: [Schema.Types.ObjectId];
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}