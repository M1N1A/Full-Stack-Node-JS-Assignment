import {Schema} from 'mongoose';

export interface IGroups {
    _id?: string;
    group_name: string;
    created_by: Schema.Types.ObjectId;
    is_active: boolean;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}