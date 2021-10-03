const express = require('express');
const router = express.Router();
const auths = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('config')
const {
    check,
    validationResult
} = require('express-validator')

//@route    GET api/auth
//@desc     TEST route
//@access   Private

router.get('/', auths, async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    }
    catch(err){
        console.log(error);
        return res.status(500).send("Server Error");
    }
});


// @route    POST api/users
// @desc     Authenticate & Get Token
// @access   Public
router.post('/',
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Password is required.'
    ).exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            email,
            password
        } = req.body

        try {
            let user = await User.findOne({
                email
            })

            if (!user) {
                return res
                    .status(400)
                    .json({
                        errors: [{
                            msg: 'Invalid Credentials'
                        }]
                    })
            }
            const  isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({ errors: [{msg:'Invalid Credentials'}]});
            }
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                    expiresIn: '5 days'
                },
                (err, token) => {
                    if (err)
                        throw err
                    res.json({
                        token
                    })
                }
            )
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
)
module.exports = router;