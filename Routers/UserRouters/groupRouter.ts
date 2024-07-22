import express, {Request, response, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../Database/Schemas/userSchema";
import tokenVerifier from "../../middlewares/tokenVerifier";
import GroupsTable from "../../Database/Schemas/groupsSchema";
import GroupsMembersTable from "../../Database/Schemas/groupMembersSchema";

const groupRouter:Router = express.Router(); 

/*
    @usage : Post a Group create
    @path : http://127.0.0.1:9393/api/groups/create
    @method : POST
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_name ,token 
 */

    groupRouter.post('/create',tokenVerifier,[
            body('group_name').not().isEmpty().withMessage("Group Name is Required"),
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

                let {group_name } = request.body;

                let groupExist = await GroupsTable.findOne({group_name:`${group_name}`});
                if(groupExist){
                    return response.status(400).json({
                        message:"This group name already exist"
                    })
                }

            
                // save in DB
                let newGroup:any = {
                    group_name:group_name,
                    created_by:user_id,
                    is_active:true
                }

                let group = new GroupsTable(newGroup);
                group = await group.save();

                return response.status(200).json({
                    message:"Group Create Successfull",
                    group:group
                })
            }
            catch(error){
                return response.status(500).json({
                    message:"Unable to Create Group",
                    error:error
                })
        }
    })


/*
    @usage  : Group Delete
    @path   : http://127.0.0.1:9393/api/groups/delete/:?group_id
    @method : GET
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_name ,token 
 */

    groupRouter.get('/delete/:group_id',tokenVerifier, async (request: Request, response: Response) => {


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

            let {group_id } = request.params;

            let deleteGroup:any = {
                is_active:'false'
            }
            let groups:any = await GroupsTable.findByIdAndUpdate(group_id, {
                $set: deleteGroup
            }, {new: true});

            return response.status(200).json({
                message:"Group Deleted Successfull",
                groups:groups
            })
            
        }
        catch(error){
            return response.status(500).json({
                message:"Unable to Delete Group",
                error:error
            })
    }
})


/*
    @usage  : Group Search or retrive all active groups
    @path   : http://127.0.0.1:9393/api/groups/
    @method : POST
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_name ,token 
 */

    groupRouter.post('/',tokenVerifier, async (request: Request, response: Response) => {


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

            let {search } = request.body; // Its optional if group search it will give result or return all active groups
            let groups:any="";
            if(search || search !=""){
                let ss = `${search}`;
                groups = await GroupsTable.find({is_active:'true',group_name:{ $regex: ss, $options: "si" }});
                return response.status(200).json({
                    message:`Group Searched Successfull`,
                    groups:groups,
                    SearchKey:ss
                })
            }else{
                groups = await GroupsTable.find({is_active:'true'});
                return response.status(200).json({
                    groups:groups
                })
            }
            
        }
        catch(error){
            return response.status(500).json({
                message:"Unable to Get Group Details",
                error:error
            })
        }
    })

/*
    @usage  : Group Add Members
    @path   : http://127.0.0.1:9393/api/groups/addMembers
    @method : POST
    @access : PRIVATE (Beacuse Only login users can access link, with validate users)
    @fields : group_id ,member_id,created_by 
 */

    groupRouter.post('/addMembers',tokenVerifier, async (request: Request, response: Response) => {


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

            let {group_id,member_id } = request.body;
            
            let Data:any=[];
            member_id.map((ids:any)=>{            //Members post in array so we divided each have values, inserted separate
                let addMembers:any = {
                    group_id:group_id,
                    members:ids,
                    created_by:user_id
                }
                Data.push(addMembers);
            });

            let groupMem:any = await GroupsMembersTable.insertMany(Data);
            
            return response.status(200).json({
                message:"Group Members Added Successfull",
                member_id: member_id,
                groupMem:groupMem,
            })
            
        }
        catch(error){
            return response.status(500).json({
                message:"Unable to Add Members in Group",
                error:error
            })
        }
    })


export default groupRouter;