
const res = require('express/lib/response')

const { MongoClient } = require("mongodb");
const { failedWithMessageResponse, successWithMessageResponse } = require('../views/json_responses/response');

const mongoUri = 'mongodb://127.0.0.1:27017/'

class User{
    constructor(username, password, email, nama) {
		this.username = username
		this.password = password
        this.email = email
        this.nama = nama
	}
    jsonObject() {
        return {
            username: this.username, 
            password: this.password, 
            email: this.email, 
            nama:this.nama
        }
    }
}
const getDBCollection = (err, db, res) => {
    if (err) {
        res.send(failedWithMessageResponse(400,"something went wrong"))
        
        return Promise.resolve("something went wrong")
        
    }else return Promise.resolve(null)
}

module.exports = {
    registerDB: async (data,res)=>{
        try {
            const user = new User(data.username, data.password, data.email, data.nama)
            MongoClient.connect(mongoUri, (err,db)=>{
                
                
                var dbo = db.db("testing");
                var dbUsers = dbo.collection("users")
                getDBCollection(err,db,res)
                    .then(async (err)=>{
                        if (!err) {
                            return await dbUsers.findOne({username: user.jsonObject().username}), null
                                
                        }else return null,"DB Error"
                        
                    })
                    .then(async (result,err)=>{
                        
                        if (!err) {
                            if (!result) {
                                return await dbUsers.findOne({email: user.jsonObject().email})
                            }else{
                                res.send(failedWithMessageResponse(400,"username already exist."))
                                db.close()
                            }
                        }else{
                            res.send(failedWithMessageResponse(400,"something went wrong"))
                            db.close()
                        }
                    })
                    .then(async (result)=>{
                        
                        if (!result) {
                            await dbUsers.insertOne(user.jsonObject())
                            return null
                                
                        }else{
                            db.close()
                            return "email already exist."
                        }
                    })
                    .then((err)=>{
                                    
                        if (err) {
                            res.send(failedWithMessageResponse(400,err))
                            
                        }
                        else {
                            res.send(successWithMessageResponse("successfully registered an account"))
                        }
                        db.close()
                    }) 
                
            })
        } catch (error) {
            console.log(error)
        }
        

    },
    // registerDB: async (data) =>{

    //     const conn = client()
    //     await conn.connect()
    //     try {
    //         const res = await conn.query("INSERT INTO users (username, password, email, nama,kelas) VALUES ('"+data.username+"', '"+data.password+"', '"+data.email+"', '"+data.nama+"',  '"+data.kelas+"');")
    //     } catch (error) {
    //         return error
    //     }
        
    //     await conn.end()
    //     return null
    // },
    // findUserByUsernameDB: async (username)=>{
    //     const conn = client()
    //     await conn.connect()
    //     const res = await conn.query("SELECT * FROM users WHERE username = '"+username+"'")
        
    //     await conn.end()
    //     return res
    // },
    // updateTokenDB: async (username, token) =>{
    //     const conn = client()
    //     await conn.connect()
    //     await conn.query("UPDATE users SET token = '"+token+"' WHERE username = '"+username+"'")
    //     const res = await conn.query("SELECT * FROM users WHERE token = '"+token+"'")
    //     await conn.end()
    //     return res

    // },
    // logoutDB: async (token) => {
    //     const conn = client()
    //     await conn.connect()
        
    //     await conn.query("UPDATE users SET token = NULL WHERE token = '"+token+"';")
        

    //     await conn.end()
    //     return res
    // }
}