import express, {Request, response, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../Database/Schemas/userSchema";
import bcrypt from "bcryptjs";
import avatar from "gravatar";
import jwt from "jsonwebtoken";
import tokenVerifier from "../../middlewares/tokenVerifier";
import ProfileTable from "../../Database/Schemas/groupMessageSchema";
import mongoose from "mongoose";
import { IUser } from "../../Models/IUser";
import GroupsTable from "../../Database/Schemas/groupsSchema";
import GroupsMembersTable from "../../Database/Schemas/groupMembersSchema";
import groupMessageTable from "../../Database/Schemas/groupMessageSchema";

const messageRouter:Router = express.Router(); 

/*
    @usage : Send Message
    @path : http://127.0.0.1:9393/api/message/send
    @method : POST
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_id ,message 
 */

    messageRouter.post('/send',tokenVerifier,[
            body('message').not().isEmpty().withMessage("Message is Required"),
            body('group_id').not().isEmpty().withMessage("Group ID is Required"),
        ], async (request: Request, response: Response) => {
    

            let errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors
                })
            }

            try{

                // read the user info from the request (based on the configuration of tokenVerifier)
                let requestedUser: any = request.headers['user'];

                // read the user info using the requestedUser
                let user:any = await User.findById(requestedUser?.id).select('-password');

                let user_id = user['_id'];

                let {group_id, message } = request.body;

                //let group ID exist or not
                let groupExist = await GroupsTable.findOne({_id:`${group_id}`});
                if(!groupExist){
                    return response.status(400).json({
                        message:"This group not exist"
                    })
                }

                //Let check Sender is existed in group or not
                let userExist = await GroupsMembersTable.findOne({group_id:`${group_id}`,members:`${user_id}`});
                if(!userExist){
                    return response.status(400).json({
                        message:"This group user not exist"
                    })
                }
            
                // save in DB
                let newMessage:any = {
                    group_id:group_id,
                    send_by:user_id,
                    message:message
                }

                let groupMessage = new groupMessageTable(newMessage);
                groupMessage = await groupMessage.save();

                return response.status(200).json({
                    message:"Group Message Sent Successfull",
                    groupMessage:groupMessage
                })
            }
            catch(error){
                return response.status(500).json({
                    message:"Unable to Send Message in Group",
                    error:error
                })
        }
    })


/*
    @usage  : Like Message
    @path   : http://127.0.0.1:9393/api/message/like
    @method : POST
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_id ,like 
 */

    messageRouter.post('/like',tokenVerifier, [
            body('message_id').not().isEmpty().withMessage("Message ID is Required"),
            body('like').not().isEmpty().withMessage("Like is Required"),
        ], async (request: Request, response: Response) => {


        let errors = validationResult(request);

        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors
            })
        }

        try{

            // read the user info from the request (based on the configuration of tokenVerifier)
            let requestedUser: any = request.headers['user'];

            // read the user info using the requestedUser
            let user:any = await User.findById(requestedUser?.id).select('-password');

            let user_id = user['_id'];

            let {message_id, like } = request.body;

            let sentMessage:any = await groupMessageTable.findOne({_id:message_id}).select('like');

            if(!sentMessage){
                return response.status(400).json({
                    message:"Message Id Incorrect",
                })
            }

            let existingLikes = sentMessage['like'];
            let likeUsers:any=[];
            if(existingLikes.length == 0){
                likeUsers.push(user_id);
            }else{
                if(existingLikes.indexOf(user_id) == -1){
                    existingLikes.push(user_id);
                }
                likeUsers=existingLikes;
            }

            let likeMessage:any = {
                like:likeUsers
            }

            let messageLikes:any = await groupMessageTable.findByIdAndUpdate(message_id, {
                $set: likeMessage
            }, {new: true});

            return response.status(200).json({
                message:"You Like group Message Successfull",
                messageLikes:messageLikes,
            })
            
        }
        catch(error){
            return response.status(500).json({
                message:"Unable to Like Message",
                error:error
            })
    }
})

export default messageRouter;