const { Client } = require('pg')
const version = require('../../package.json')
require('dotenv').config()

module.exports = {
    checkRequirements : (data) => {
        let checkUsername = ()=>{
            if (data["username"] != null) {
                const a = data["username"].search(/\s/g) < 0;  
                if (!a) {
                    return [a,"Invalid format on username"]
                }
                return [a,"Please fill Username"]
            }else{
                return [true,""]
            }
        }
        let checkEmail = () => {
            if (data["email"] != null) {
                const a = data["email"].search("@") > 0 && data["email"].search(/\s/g) < 0;
                if (!a) {
                    return [a,"Invalid format on email"]
                }
                return [a,"Please fill email"]
            }else{
                return [true,""]
            }
        }
        let checkPassword = ()=>{
            if (data["password"] != null) {
                
                const a = data["password"].search(/\s/g) < 0 && data["password"].match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) != null;   
                if (!a) {
                    return [a,"Invalid format on password"]
                }
                return [a,"Please fill password"]
            }else{
                return [true,""]
            }
        }

        return checkUsername() && checkEmail() && checkPassword()
    },
    checkReservationItem: (data) => {
        return data["name"] != null && data["description"] != null && data["category"] != null && data["name"] != null && data["location"] != null && data["storeid"] != null
        
    },
    client : () => {
        return new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
        })
    },
    clientAuthentication : (req)=>{
        if (req.headers.authorization != null) {
            return JSON.parse(Buffer.from(req.headers.authorization, 'base64').toString('ascii')).serverkey == version["serverkey"]    
        }else{
            return false
        }
        
    },
    auth: (req)=>{
        return JSON.parse(Buffer.from(req.headers.authorization, 'base64').toString('ascii'))
    }
    
}