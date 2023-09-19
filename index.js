const express = require('express');
const app  = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer');
const path = require('path');
const PORT = process.env.port || 4600;
const userSchema = require('./model/UserModel')
const postSchema = require('./model/PostModel')
const profileSchema = require('./model/ProfileModel')
const CommentSchema = require('./model/CommentsModel')
//Body parser turn front end data into json format!
app.use(express.json())

//to acess data from backend we should enable cors
app.use(cors(
    
    {

    origin:'https://gentle-biscuit-57ba17.netlify.app/',
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}

))

app.use(express.static('public'))

app.use(cookieParser())

//Register New user
app.post('/register',(req,res)=>{

    const {name,email,password} = req.body;

    userSchema.findOne({email:email})
    .then(pre=>{
        if(pre){
            res.json('Email already existed use another mail ID ')
        }
        else{
            bcrypt.hash(password,10)
            .then(hash=>{
                userSchema.create({name,email,password:hash})
                .then(result =>res.json(result))
                .catch(err=>res.json(err))
        
            }).catch(err => res.json(err))
        }
    })
    .catch(err=>res.json(err))
  
})

//Login Registred User

app.post('/login',(req,res)=>{
    const{email,password} = req.body;
    userSchema.findOne({email:email})
    .then(user=>{
        if(user){
            bcrypt.compare(password,user.password,(err,response)=>{
                if(response){
                    
                    const token = jwt.sign({email:user.email,name:user.name},'key',{expiresIn:'1d'})
                    // console.log(token)
                    res.cookie('token',token)
                    return res.json('success')

                }else{
                     res.json('password is incorrect')
                }
            })
        }
        else{
            res.json('user not exist')
        }
    })
    
})

//Logout functionality

//middle ware to check 

const verifyUser = (req,res,next)=>{
    const token = req.cookies.token
    if(!token) {
        res.json('Token not available')
    }else{
        jwt.verify(token,'key',(err,decoded)=>{
            if(err){
                res.json('Wrong Token')
            }else{
                req.email = decoded.email
                req.name = decoded.name
                next()
            }
        })
    }
}
app.get('/home',verifyUser,(req,res)=>{
    res.json({email: req.email, name:req.name})
})

//clear cookie and logout

app.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.json('success')
})

//Get all post in HOme.........
app.get('/getPost',(req,res)=>{
        postSchema.find()
        .then(post => res.json(post))
        .catch(err => res.json(err))
})

///Get postByid.............
app.get('/getpostbyid/:id',(req,res)=>{
    const id = req.params.id
    // console.log(id)
    postSchema.findById({_id:id})
    .then(post=>res.json(post))
    .catch(err=>res.json(err));
})

//DELETE postbyid.........
app.delete('/deletebyid/:id',(req,res)=>{
    const id = req.params.id
    postSchema.findByIdAndDelete({_id:id})
    .then(delPost => res.json(delPost))
    .catch(err => res.json(err))
})

///Edit post by id..........
app.put('/editpost/:id',(req,res)=>{

    const id = req.params.id;
    // console.log(id)
    postSchema.findByIdAndUpdate({_id:id},{
    title:req.body.title,description:req.body.description})
    .then(result => res.json('success'))
    .catch(err => res.json(err))
})



//create post APi

//Storage to store posts

const storage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,'public/images')
        },
        filename: ( req,file,cb)=>{
            cb(null,file.fieldname+'_'+Date.now()+ path.extname(file.originalname))
        }
        
})

const upload = multer({
    storage:storage
})

app.post('/createPost',verifyUser,upload.single('file'),(req,res)=>{
    
    const {title,description,email,name} = req.body
    console.log({title,description,email,name,file:req.file.filename});
    profileSchema.findOne({email:email})
    .then(result=>{
        console.log(result.file)
                postSchema.create({title,description,email,name,file:req.file.filename,profile:result.file})
                .then(result => res.json('success'))
                .catch(err => res.json(err))
        })
    .catch(err=>res.json('updateProfile'))
    
})

//create Profile 


app.post('/profile',upload.single('file'),(req,res)=>{

    const {username,bio,birth,name,email} = req.body
    console.log({username,bio,birth,email,name,file:req.file.filename});
    profileSchema.create({username,bio,birth,email,name,file:req.file.filename})
    .then(profile => res.json('success'))
    .catch(err => res.json(err))
})

app.get('/myprofile/:email',(req,res)=>{

    const myemail = req.params.email
    profileSchema.find({email:myemail})
    .then(myProfile => res.json(myProfile))
    .catch(err => console.log(err))
})






//get all users.....
app.get('/getUser',(req,res)=>{
    userSchema.find()
    .then(users=>res.json(users))
    .catch(err=>res.json(err))
})

//post comments
app.post('/comments',(req,res)=>{

    const {comment,id,commentPerson} = req.body
    console.log(req.body);
        CommentSchema.create({comment,id,commentPerson})
        .then(result => res.json('commentAdded'))
        .catch(err=>res.json('problem'))
})
//get comments by id
app.get('/getcommentbyid/:id',(req,res)=>{
    const myid = req.params.id
    console.log(myid);
    CommentSchema.find({id:myid})
    .then(result =>res.json(result))
    .catch(err =>res.json('err'))
})

//delete comment by id
app.delete('/deletecomment/:ID',(req,res)=>{

    const cmtid = req.params.ID
    console.log(cmtid);
    CommentSchema.findByIdAndDelete({_id:cmtid})
    .then(result =>res.json('deleted'))
    .catch(err => console.log(err))
})



//Connected to the dataBase online
mongoose.connect(process.env.DB)
.then(connect=>console.log('DB connected'))
.catch(err=>console.log(err));


//Creating and running sever in the port
app.listen(PORT,()=>{
    console.log('server running in port ',PORT)
})


