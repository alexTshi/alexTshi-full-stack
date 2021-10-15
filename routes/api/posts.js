const express = require("express");
const auths = require('../../middleware/auth');
const {
    check,
    validationResult
} = require("express-validator");
const router = express.Router();
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    POST api/posts
//@desc     Create a Posts
//@access   Private
router.post("/", [auths], [check('text', 'Text is required').not().isEmpty()],
 async  (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        const post = new Post(newPost);
        await post.save();
        res.json(post);
    } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error');
    }
});

//@route    GET api/posts
//@desc     GET All Posts
//@access   Private
router.get('/', auths, async (req, res) => {
    try {
       const posts = await Post.find().sort({date: -1});
       res.send(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    GET api/posts/:post_id
//@desc     GET Post By ID
//@access   Private
router.get('/:post_id', auths, async (req, res) => {
    try {
       const posts = await Post.findById(req.params.post_id);
        if(!posts){
            return res.status(404).json('Post Not Found');
        }
       res.send(posts);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectID'){
            return res.status(404).json('Post not found');
        }
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/posts/:post_id
//@desc     DELETE a Post By ID
//@access   Private
router.delete('/:post_id', auths, async (req, res) => {
    try {
       const post = await Post.findById(req.params.post_id);
       //Check User
       if(!post){
        return res.status(404).json('Post Not Found');
    } 
       if(post.user.toString() !== (req.user.id)) {
            return res.status(401).json('User not authorized');
        }
        await post.remove();
       res.send({msg: 'Post deleted successfully.'});
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectID'){
            return res.status(404).json('Post not found');
        }
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/posts/:post_id
//@desc     Like a Post
//@access   Private
router.put('/like/:post_id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        //Check if the post has already been liked by user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){           
            return res.status(400).json({msg: 'Post already liked'});
        }
        post.likes.unshift({user: req.user.id})
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/posts/:post_id
//@desc     Remove Like from Post
//@access   Private
router.put('/unlike/:post_id', auths, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        //Get remove index
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
             return res.status(400).json({msg: 'Post has not been liked'});
        }
        const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    POST api/posts/comments:post_id
//@desc     Add Comment to Post
//@access   Private
router.post("/comment/:post_id", [auths], [check('text', 'Text is required').not().isEmpty()], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.post_id);
        
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error');
    }
});

//@route    DELETE api/posts/comments/:post_id/comment_id
//@desc     DELETE Comment to Post
//@access   Private
router.delete("/comment/:post_id/:comment_id", auths, async (req, res) => {

    try {
        const post = await Post.findById(req.params.post_id);

        //Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        //Make sure the comment exists
        if(!comment){
            return res.status(404).json({msg: 'Comment Not Found'});
        }
        //Check User
        if(comment.user.toString() !== req.user.id){
            return res.status(404).json({msg: 'User Not Authorized'});
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;