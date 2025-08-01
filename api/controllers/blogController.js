import fs from 'fs'
import imageKit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';
import userModel from '../models/user.model.js';

export const addBlog = async(req,res) => {
    try { 
        // console.log(req.body);
        const {title,subTitle,description,category, isPublished ,visibility} = JSON.parse(req.body.blog);
        const imageFile = req.file;
   
        // check if all fields are present 
        if(!title || !description || !category || !imageFile || !visibility ){
            return res.json({success:false,message:"missing required fields"});
        }


        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await  imageKit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:"/blogs"
        })
        // optimization ythrough imagekit url tranformation
        const optimizedImageUrl = imageKit.url({
            path:response.filePath,
            transformation: [
                {quality:'auto'},//auto compression
                {format:'webp'},// convert to modern format
                {width:'1280'} // width resizing
            ]
        })

        const image = optimizedImageUrl;
        await Blog.create({title,subTitle,description,category,image,isPublished,visibility})
        res.json({success:true,message:"blog addedd successfully"});

    } catch (error) {
        // console.log('hi from catch')
        res.json({success:false,message:error.message});
    }
}


export const getAllBlogs = async(req,res) => {
    try {
        const blogs = await Blog.find({isPublished:true});
        res.json({success:true, blogs})
    } catch (error) {
        res.json({success:false,message:error.message});

    }
}

export const getBlogById = async(req,res) => {
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId);
        if(!blog){
            return res.json({success:false,message:"Blog not found"});
        }
        res.json({success:true,blog});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export const deleteBlogById = async(req,res) => {
    try {
        const {id} = req.body;
        await Blog.findByIdAndDelete(id);
  
        // delete all comments associated with blog
        await Comment.deleteMany({blog:id});

        res.json({success:true,message:"Blog Deleted successfully"});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const togglePublish = async (req,res) => {
    try {
        const {id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success:true,message:"blog status updated"});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}



export const addComment = async(req, res) => {
    try {
       const {blog,  content} = req.body;
       const userId = req.userId;
       const user = await userModel.findById(userId);
       if(!user){
        return res.json({success:false, message:"user not found"});
        
       }
       await Comment.create({
        blog,
        user:userId,
        name:user.name,
        content
       });

        res.json({success:true,message:"comment added for review to admin"});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getBlogComments = async(req,res) => {
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog:blogId,isApproved:true}).sort({createdAt: -1}).populate('user','name');
        res.json({success:true,comments})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export const generateContent = async(req, res) => {
    try {
        const {prompt} = req.body;
       const content =  await main(prompt + 'Generate a blog content on this topic in simple text format');
        res.json({success:true,content});

    } catch (error) {
        res.json({success:false,message: error.message})
    }
}
