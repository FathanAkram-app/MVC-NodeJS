
const res = require('express/lib/response')
const bcrypt = require('bcrypt');

const { MongoClient } = require("mongodb");
const { failedWithMessageResponse, successWithMessageResponse } = require('../views/json_responses/response');

const mongoUri = 'mongodb://172.17.0.3:27017/'

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
        
        return Promise.resolve("something went wrong")
        
    }else return Promise.resolve(null)
}

module.exports = {
    registerDB: async (data,res)=>{
        try {
            const user = new User(data.username, data.password, data.email, data.nama)
            MongoClient.connect(mongoUri, async (err,db)=>{
                var dbUsers = null
                    
                if (!err) {
                    var dbo = db.db("testing");
                    dbUsers = dbo.collection("users")
                    const usrname = await dbUsers.findOne({username: user.jsonObject().username})
                    if (!usrname) {
                        const email = await dbUsers.findOne({email: user.jsonObject().email})
                        if (!email) {
                            await dbUsers.insertOne(user.jsonObject())
                            res.send(successWithMessageResponse("successfully registered an account"))
                            db.close()
                        }else{
                            res.send(failedWithMessageResponse(400,"email already exist."))
                            db.close()
                        }
                    }
                    else{
                        res.send(failedWithMessageResponse(400,"username already exist."))
                        db.close()
                    }
                }else{
                    res.send(failedWithMessageResponse(502,err))
                }
            
                
            
                
            })
        } catch (error) {
            console.log(error)
        }
        

    },
    loginDB: async (data,res,token)=>{
        try {
            const user = new User(data.username, data.password)
            MongoClient.connect(mongoUri, async(err,db)=>{
                var dbo = db.db("testing");
                var dbUsers = dbo.collection("users")
                
                if (!err){
                    const usr = await dbUsers.findOne({"username": user.jsonObject().username})
                    if (usr) {
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
                }
            })
        }catch(error){
            console.log(error)
        }
    },
    logoutDB: async(token,res)=>{
        MongoClient.connect(mongoUri,async(err, db)=>{
            var dbo = db.db("testing")
            var dbUsers = dbo.collection("users")
            if (!err) {
                const usr = await dbUsers.updateOne({token: token},{$set: {token: null}},{upsert: false})
                if (usr.modifiedCount>0) {
                    res.send(successWithMessageResponse("successfully logged-out"))
                }else{
                    res.send(failedWithMessageResponse("Session Expired"))
                }
            }
            else{
                res.send(failedWithMessageResponse(502, err))
            }
            db.close()
        })

    }
}