
const res = require('express/lib/response')

const { MongoClient } = require("mongodb");
const { failedWithMessageResponse, successWithMessageResponse } = require('../views/json_responses/response');

const mongoUri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.3.1'

class User{
    constructor(username, password, email, nama,kelas) {
		this.username = username
		this.password = password
        this.email = email
        this.nama = nama
        this.kelas = kelas
	}
    jsonObject() {
        return {
            username: this.username, 
            password: this.password, 
            email: this.email, 
            nama:this.nama,
            kelas:this.kelas
        }
    }
}


module.exports = {
    registerDB: async (data,res)=>{
        try {
            const user = new User(data.username, data.password, data.email, data.nama,  data.kelas)
            MongoClient.connect(mongoUri, async function(err, db) {
                if (err) res.send(failedWithMessageResponse(400,err))
                var dbo = db.db("testing");
                const dbUsers = dbo.collection("users")
                dbUsers.findOne({username: user.jsonObject().username}, function(err,result) {
                    if (!result) {
                        dbUsers.findOne({email: user.jsonObject().email}, function(err,result) {
                            if (!result) {
                                dbUsers.insertOne(user.jsonObject(), function(err, result) {
                                    if (err) res.send(failedWithMessageResponse(400,err))
                                    else {
                                        res.send(successWithMessageResponse("successfully registered an account"))
                                        db.close()
                                    }
                                })
                            }else{
                                res.send(failedWithMessageResponse(400,"email already exist."))
                                db.close()
                            }
                        })
                    }else{
                        res.send(failedWithMessageResponse(400,"username already exist."))
                        db.close()
                    }
                    
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