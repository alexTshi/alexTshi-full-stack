const jwt = require('jsonwebtoken');
const config = require('config')


authenticate = (req, res, next ) => {
    // Get token from the header
    const token = req.header('x-auth-token');
    
    //check if not token
    if(!token){
        return res.status(401).json({msg: 'No Token, authorization denied.'})
    }
    try{
        jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
            if(error){
                return res.status(401).json({msg: 'Token is not valid.'});
            } 
            else{
                req.user = decoded.user;
                //next();
            }
        })
    }
    catch(err){
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
    return next();
}

module.exports = authenticate;