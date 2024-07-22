import mongoose, {Schema, Model} from 'mongoose';
import { IGroupMessage } from '../../Models/IGroupMessage';

const groupMessageSchema: Schema = new Schema<IGroupMessage>({
    message: {type: String},
    send_by: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    like: {type: [Schema.Types.ObjectId]},
    is_active: {type: Boolean},
}, {timestamps: true});

const groupMessageTable: Model<IGroupMessage> = mongoose.model<IGroupMessage>('group-message', groupMessageSchema);
export default groupMessageTable;