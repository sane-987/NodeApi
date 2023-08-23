const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

var userSchema = new mongoose.Schema(
    {
        username : {
            type:String,
            //required : true
        },
        email : {
            type : String,
            required : true,
            //unique : true
        },
        password : {
            type : String,
            //required : true
        },
        date : {
            type : Date,
            default : Date.now
        }
    }
)


userSchema.pre("save", async function(next){
    try{
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
        //console.log(this.email, this.password)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    }
    catch(error){
        next(error)
    }

})

userSchema.methods.isValidPassword = async function(password) {
    try {
        const result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        throw error
    }
}


module.exports = mongoose.model('User', userSchema)