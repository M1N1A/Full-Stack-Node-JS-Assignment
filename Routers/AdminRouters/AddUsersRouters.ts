import express, {Request, response, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../Database/Schemas/userSchema";
import bcrypt from "bcryptjs";
import avatar from "gravatar";

const AddUsersRouters:Router = express.Router(); 

/*
    @usage : Get a User Details
    @path : http://127.0.0.1:9898/api/users
    @method : GET
    @access : PUBLIC
    @fields : 
 */
    AddUsersRouters.get("/", async (request:Request, response:Response)=>{
        try{
            let user = await User.find();
            if(user){
                
                return response.status(200).json({
                    user:user
                })
            }
            response.status(200);
            response.json({
                user:user
            })
        }
        catch(error){
            response.status(500);
            response.json({
                error:error
            })
        }
        
    })

/*
    @usage : Get a User detail by user id
    @path : http://127.0.0.1:9898/api/users/userId
    @method : GET
    @access : PUBLIC
    @fields : userId
*/
    AddUsersRouters.get("/:userId", async (request:Request, response:Response)=>{

        try{
            let {userId} = request.params;

            let users = await User.find({_id:userId});
            if(users){
                
                return response.status(200).json({
                    user:users
                })
            }
            
        }
        catch(error){
            response.status(500);
            response.json({
                error:error
            })
        }
        
    });

/*
    @usage : Post a User Details
    @path : http://127.0.0.1:9898/api/users/create
    @method : POST
    @access : PUBLIC
    @fields : name ,email, password, isAdmin, created_by
 */

    AddUsersRouters.post('/createUser', [
        body('name').not().isEmpty().withMessage("Name is Required"),
        body('email').isEmail().withMessage("Proper Email is Required"),
        body('password').isStrongPassword({
            minSymbols: 1,
            minNumbers: 1,
            minUppercase: 1,
            minLowercase: 1,
            minLength: 5
        }).withMessage("Strong Password is Required"),
        
        ], async (request: Request, response: Response) => {
    

        let errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors
            })
        }

        try{
            let {name ,email, password, isAdmin, created_by } = request.body;

            let userExist = await User.findOne({email:`${email}`});
            if(userExist){
                return response.status(400).json({
                    message:"This email already exist"
                })
            }

            //encrypt Password
            let salt = await bcrypt.genSalt(10);
            let encryptPassword = await bcrypt.hash(password,salt);

            //avatar
            let avatarImg = avatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            });

            // save in DB
            let newUser:any = {
                name:name,
                email:email,
                password:encryptPassword,
                isAdmin:isAdmin,
                avatarImg:avatarImg,
                created_by:created_by
            }
            let adminUserExist = await User.findOne({_id:created_by,isAdmin:true});
            if(adminUserExist){
                let user = new User(newUser);
                user = await user.save();

                return response.status(200).json({
                    message:"User Creation Successfull",
                    user:user
                })
            }

            return response.status(400).json({
                message:"Created by ID is not admin, Please check and try again",
                adminUserExist:adminUserExist
            })

        }
        catch(error){
            return response.status(500).json({
                message:"Unable to create User",
                error:error
            })
        }
})

/*
    @usage : Update a User Details
    @path : http://127.0.0.1:9898/api/users/update
    @method : PUT
    @access : PUBLIC
    @fields : _id, name ,email, password, isAdmin, created_by
 */

    AddUsersRouters.put('/updateUser/:userId', [
        body('name').not().isEmpty().withMessage("Name is Required"),
        body('email').isEmail().withMessage("Proper Email is Required"),
        body('password').isStrongPassword({
            minSymbols: 1,
            minNumbers: 1,
            minUppercase: 1,
            minLowercase: 1,
            minLength: 5
        }).withMessage("Strong Password is Required"),
        
        ], async (request: Request, response: Response) => {
    

        let errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors
            })
        }

        try{
            let {name ,email, password, isAdmin, created_by } = request.body;
            let {userId} = request.params;

            let userExist = await User.findOne({email:`${email}`,_id:{$ne:userId}});
            if(userExist){
                return response.status(400).json({
                    message:"This email already exist"
                })
            }

            //encrypt Password
            let salt = await bcrypt.genSalt(10);
            let encryptPassword = await bcrypt.hash(password,salt);

            //avatar
            let avatarImg = avatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            });

            // update in DB
            let updateUser:any = {
                name:name,
                email:email,
                password:encryptPassword,
                isAdmin:isAdmin,
                avatarImg:avatarImg,
                created_by:created_by
            }
            let adminUserExist = await User.findOne({_id:created_by,isAdmin:true});
            if(adminUserExist){
               
                let user = await User.findByIdAndUpdate(userId, {
                    $set: updateUser
                }, {new: true});

                return response.status(200).json({
                    message:"User Update Successfull",
                    user:user
                })
            }

            return response.status(400).json({
                message:"Created by ID is not admin, Please check and try again",
                adminUserExist:adminUserExist
            })

        }
        catch(error){
            return response.status(500).json({
                message:"Unable to update User",
                error:error
            })
        }
})

export default AddUsersRouters;