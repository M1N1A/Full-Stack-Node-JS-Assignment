import {Schema} from 'mongoose';
export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    avatarImg: string;
    created_by:Schema.Types.ObjectId;
    isAdmin: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}