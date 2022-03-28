const { clientAuthentication, auth, checkRequirements } = require('../helpers/helper');
const bcrypt = require('bcrypt');
const { registerDB, logoutDB, updateTokenDB, findUserByUsernameDB, loginDB } = require('../models/auth_db');
const { loginFailedResponse } = require('../views/json_responses/auth_response');
const { successWithMessageAndResultResponse, clientAuthFailedResponse, successWithMessageResponse, failedWithMessageResponse } = require('../views/json_responses/response');
module.exports = {
    registerController : (req, res) => {

        if(clientAuthentication(req)){
            bcrypt.genSalt(10, function(err, salt) {
                const data = auth(req)
                bcrypt.hash(data.password, salt, function(err, hash) {
                    if (checkRequirements(data)[0]) registerDB({...data, password: hash},res)
                    else res.send(failedWithMessageResponse(400,checkRequirements(data)[1]))
                });
            });
        }else res.send(clientAuthFailedResponse)
    },

    
    loginController : (req, res) =>{
        require('crypto').randomBytes(48, function(err, buffer) {
            const token = buffer.toString('hex');
            
            if(clientAuthentication(req)){
                loginDB(auth(req), res, token)
            }else{
                res.send(clientAuthFailedResponse)
            }
        });
    },

    logoutController : (req, res) => {
        if(clientAuthentication(req)){
            logoutDB(req.body.token,res)
        }else{
            res.send(clientAuthFailedResponse)
        }
    }
}

