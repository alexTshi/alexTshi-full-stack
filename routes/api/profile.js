const express = require("express");
const config = require("config");
const request = require("request");
const router = express.Router();
const axios = require('axios');
const auths = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');
const { route } = require("./users");
const { findOneAndRemove } = require("../../models/User");

//@route    GET api/profile/me
//@desc     Get current users
//@access   Private

router.get("/me", auths, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json('profile');
    }
    catch(err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//@route    POST api/profile
//@desc     Create or update user profile
//@access   Private

router.post("/", auths, [check('status', 'status is required').not().isEmpty(), 
    check('skills', 'Skills is required').not().isEmpty()], 
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin   
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //Build Social Object
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;
      
        try {
            let profile = await Profile.findOne({user: req.user.id});
            if(profile){
                //update
                profile = await Profile.findOneAndUpdate(
                    {user: profile.user},
                    {$set: profileFields},
                    {new: true}
                );
                return res.json(profile);
            }
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        }
        catch(err){
            console.error(err.message);
            res.status(500).send('Server Error')
        }
})

//@route    GET api/profile
//@desc     Get all profiles
//@access   Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    GET api/profile/user/:user_id
//@desc     Get Profile by user ID
//@access   Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile) {
            return res.status(400).json({msg: 'Profile not found.'});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found.'});
        }
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/profile
//@desc     DELETE Profile, users & posts
//@access   Private

router.delete('/', auths, async (req, res) => {
    try {
        //Todo remove user Posts
        //Remove Profile
        await Profile.findOneAndDelete({user: req.user.id});
        //Remove User
        await User.findOneAndDelete({_id: req.user.id});
        res.status(400).json({msg: 'User Deleted.'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/profile/experience
//@desc     Update Profile Experience
//@access   Private

router.put('/experience', auths, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()],
     async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        location, 
        from, 
        to, 
        current, 
        description
    } = req.body;
    
    const newExp = {
        title,
        company,
        location, 
        from, 
        to, 
        current, 
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    DELETE api/profile/experience/:exp_id
//@desc     DELETE Profile Experience
//@access   Private
router.delete('/experience/:exp_id', auths, async (req, res) => {
         try {
            const profile = await Profile.findOne({user: req.user.id});
            //Get remove Index
            const removeIndex = profile.experience.map(item => item.id)
            .indexOf(req.params.exp_id);
            
            profile.experience.splice(removeIndex, 1);
            await profile.save();
            
            res.json(profile);
         } catch (err) {
             console.error(err.message);
             res.status(500).json(err.message);
         }
});

router.put('/education', auths, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()],
     async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {
        school,
        degree,
        fieldofstudy, 
        from, 
        to, 
        current, 
        description
    } = req.body;
    
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from, 
        to, 
        current, 
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    DELETE api/profile/education/:exp_id
//@desc     DELETE Profile education
//@access   Private
router.delete('/education/:edu_id', auths, async (req, res) => {
         try {
            const profile = await Profile.findOne({user: req.user.id});
            //Get remove Index
            const removeIndex = profile.education.map(item => item.id)
            .indexOf(req.params.edu_id);
            
            profile.education.splice(removeIndex, 1);
            await profile.save();
            
            res.json(profile);
         } catch (err) {
             console.error(err.message);
             res.status(500).json(err.message);
         }
});

//@route    GET api/profile/github/:username
//@desc     GET Gitbug Profile
//@access   Public
// router.get('/github/:username', (req, res) => {
//     try {
//         const options = {
//             uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort
//             =created:asc&client_id=${config.get('githubClientId')}&client_secrets=${config.get('githubSecret')}`,
//             method: 'GET',
//             headers: { 'user-agent': 'node.js'}
//         };
//         request(options, (error, response, body) => {
//             if(error) console.log(error);
//             if(response.statusCode !== 200){
//                 res.status(404).json({msg: 'No Github profile found!'});
//             }
//             res.json(json(body));
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json(err.message);
//     }
// });
router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    }
    catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
});

module.exports = router;