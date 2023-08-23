const express = require('express')

const app = express()
const {engine} = require("express-handlebars");
const dotenv = require("dotenv")
dotenv.config()

app.engine('handlebars', engine({
    defaultLayout : 'main'
}))

app.use(express.urlencoded({extended : true }))

app.set('view engine','handlebars')

app.use("/", require("./routes/users"))

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error : {
            status : err.status || 500,
            message : err.message,
        },
    })
})




app.listen(4000, ()=> {
    console.log("express server connected at 4000")
})
