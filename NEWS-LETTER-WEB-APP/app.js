const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req , res){
    res.sendFile(__dirname + "/signup.html")
})

app.post("/" , function(req , res){
    var fName = req.body.fname;
    var Lname = req.body.lname;
    var email = req.body.email;

    var data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fName,
                    LNAME: Lname
                }
            }
        ]
    };
    console.log(fName , Lname , email);
    var JSONdata = JSON.stringify(data);
    const url = "https://us22.api.mailchimp.com/3.0/lists/mailchimp(/listID)";
    const options = {
        method: "POST",
        auth:"shayan:(mailchimp_APIKEY)"

    }

const request = https.request(url , options , function(response){
        response.on("data", function(data){
          if(response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");
          }  
          else{
            res.sendFile(__dirname + "/failure.html");
          }
        })
    });

    request.write(JSONdata);
    request.end();
});


app.post("/failure" , function(req , res){
    res.redirect("/");
})

app.listen(process.env.PORT || 3000 , function(){
    console.log("Server is running");
});
