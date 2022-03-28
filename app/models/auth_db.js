
const res = require('express/lib/response')
const bcrypt = require('bcrypt');

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
const checkDBError = (err, res) => {
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
                checkDBError(err,res)
                    .then(async (err)=>{
                        if (!err) return await dbUsers.findOne({username: user.jsonObject().username}), null
                        else return null,"DB Error"
                    })
                    .then(async (result,err)=>{
                        
                        if (!err) {
                            if (!result) return await dbUsers.findOne({email: user.jsonObject().email})
                            else{
                                res.send(failedWithMessageResponse(400,"username already exist."))
                                db.close()
                            }
                        }else{
                            res.send(failedWithMessageResponse(502,err))
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
    loginDB: async (data,res,token)=>{
        try {
            const user = new User(data.username, data.password)
            MongoClient.connect(mongoUri, (err,db)=>{
                var dbo = db.db("testing");
                var dbUsers = dbo.collection("users")
                checkDBError(err,res)
                    .then(async (err)=>{
                        if (!err) return false
                        else return "DB Error"
                    })
                    .then(async(err)=>{
                        const usr = await dbUsers.findOne({"username": user.jsonObject().username})
                        if (!err && usr) {
                            const compare = await bcrypt.compare(user.password,usr.password)
                            if (compare) {
                                await dbUsers.updateOne({username: usr.username},{$set:{token:token}},{upsert:false})
                                res.send(successWithMessageResponse("successfully logged-in"))
                                db.close()
                            }else{
                                res.send(failedWithMessageResponse(400,"Username/Password is wrong"))
                                db.close()
                            }
                        }else if (!usr && !err) {
                            res.send(failedWithMessageResponse(400,"Username/Password is wrong"))
                            db.close()
                        }else{
                            res.send(failedWithMessageResponse(502,err))
                            db.close()
                        }
                    })
            })
        } catch (err){
            console.log(err)
        }
    },
    logoutDB: async(token,res)=>{
        MongoClient.connect(mongoUri,(err, db)=>{
            var dbo = db.db("testing");
            var dbUsers = dbo.collection("users")
            checkDBError(err,res)
                .then(async (err)=>{
                    if (!err) return false
                    else return "DB Error"
                })
                .then(async(err)=>{
                    if (!err) return await dbUsers.updateOne({token: token},{$set: {token: null}},{upsert: false})
                    else{
                        res.send(failedWithMessageResponse(502, "DB ERROR"))
                        return null
                    }
                })
                .then((result)=>{
                    if (result.modifiedCount>0) {
                        res.send(successWithMessageResponse("successfully logged-out"))
                    }else{
                        res.send(failedWithMessageResponse("Session Expired"))
                    }

                    db.close()
                })

        })
    }
}