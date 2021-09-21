const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const User = require("../../models/User")
const {
    body,
    validationResult
} = require("express-validator")
//@route    Post api/users
//@desc     register User
//@access   Public

router.post("/", [
   //Validation Checkers
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include valid email").isEmail,
    body("password", "Please enter a password with 6 or more characters").isLength({min: 6})
    ], 
    async (req, res) => {
        const errors = validationResult(req)
        console.log(req.body)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {name, email, password} = req.body
        try{
            //See if user Exists
            let user = await User.findOne({ email })

            if(user){
                res.status(400).json({errors: [{msg: "User already Exit"}]})
            }
        //Get users gravitar
        
        //Encrpyt Password
        
        //Return jsonwebtoken

        res.send("User route")
        }
        catch(err){
            console.log(error(err.message))
            res.status(500).send("Server Error")
        }
})

module.exports = router