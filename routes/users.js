const express = require('express')

const router = express.Router()

const db = require("../config/key")

const createError = require("http-errors")

const User = require("../models/User")

const {signAccessToken, signRefreshToken} = require("../helpers/jwt")

const {verifyAccessToken, verifyRefreshToken} = require("../helpers/jwt")

router.get('/',(req, res) => {

    res.render('welcome')
})

router.get("/welcomeuser", verifyAccessToken, async(req, res) => {
    res.render("dashboard")
})

router.get("/users/login",(req, res)=> {
    res.render("login")
})
router.get("/users/register", (req, res) => {
    res.render("register")
})


//Post Register
router.post("/users/register", async(req, res, next) => {
    try {

        var {username, email, password1, password2} = req.body
        //console.log(req.body)
        if (!username || !email || !password1 || !password2) {
            throw createError.BadRequest()
        }
        if(password1 != password2){
            throw createError.Conflict("passwords do not match")
        }

        const doesExist = await User.findOne({email : email})
        if (doesExist) throw createError.Conflict(`${email} is already been registered`)
        
        const user = new User({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password1
        })
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)
        res.send({accessToken, refreshToken})
        

    } catch (error) {
        next(error)
    }
})


//Post Login
router.post("/users/login", async(req, res, next) => {
    const user = await User.findOne({email : req.body.email})
    if (!user) throw createError.NotFound("User not registered")

    const isMatch = await user.isValidPassword(req.body.password)
    if (!isMatch) throw createError.Unauthorized("Username/Password is invalid")

    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    res.send({accessToken, refreshToken}).status(200)
    



})


//Refresh Token
router.post("/users/refresh-token", async(req, res, next) => {
    try {
        const {refreshToken} = req.body
        if(!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        
        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)

        res.send({accessToken:accessToken, refreshToken : refToken})
        
    } catch (error) {
        next(error)
    }
})


//Logout
router.post("/users/logout", async(req, res, next) => {
    
})


module.exports = router