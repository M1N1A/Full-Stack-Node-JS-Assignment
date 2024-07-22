import express, {Request, response, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../Database/Schemas/userSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import tokenVerifier from "../../middlewares/tokenVerifier";
import { IUser } from "../../Models/IUser";

const LoginRouters:Router = express.Router(); 

/*
    @usage : Login
    @path : http://127.0.0.1:9898/api/login
    @method : GET
    @access : PUBLIC
    @fields : email, password 
*/

LoginRouters.post("/",[

    body('email').isEmail().withMessage("Email is Required"),
    body('password').isStrongPassword({
        minLength:5,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    }).withMessage("Password is not Strong"),
    body('isAdmin').not().isEmpty().withMessage("Admin Condition Required")
    ],async (request:Request, response:Response)=>{

        let error = validationResult(request);
        if(!error.isEmpty()){
            return response.status(404).json({
                error:error
            })
        }

        try{

            let {email, password, isAdmin} = request.body;

            //email validation
            let user:IUser | null = await User.findOne({email:email,isAdmin:isAdmin});
            if(!user){
                let message ="";
                if(isAdmin=="true"){
                    message ="Admin Email not Exist"
                }else{
                    message ="User Email not Exist"
                }
                return response.status(401).json({
                    message:message
                })
            }

            //password Validation
            let ismatch = await bcrypt.compare(password,user.password);
            if(!ismatch){
                return response.status(401).json({
                    message:"Password is wrong"
                })
            }

            //token
            let payload={
                user:{
                    id:user._id,
                    email:user.email
                }
            }

            const secreatKey :string | undefined = process.env.JWT_SECRET_KEY;
            if(secreatKey){
                let token:string | undefined = jwt.sign(payload,secreatKey, {expiresIn:10000000});
                return response.status(200).json({
                    message:"Login Successfully",
                    token:token,
                    user:user
                })
            }

        }
        catch(error){
            return response.status(500).json({
                message:"Unable to Login",
                error:error
            })
        }
})

/*
    @usage : Get userInfo
    @path : http://127.0.0.1:9898/api/login/me
    @method : GET
    @access : PRIVATE (Beacuse Once Login we call info it will retrive userInfo validate token pass)
    @fields : no-fields
 */
    LoginRouters.get('/me', tokenVerifier, async (request: Request, response: Response) => {

    // read the user info from the request (based on the configuration of tokenVerifier)
    let requestedUser: any = request.headers['user'];

    // read the user info using the requestedUser
    let user = await User.findById(requestedUser?.id).select('-password');

    response.status(200).json({
        msg: 'Token verification is success!',
        user: user
    });
});

export default LoginRouters;