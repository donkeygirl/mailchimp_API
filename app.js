import express from 'express';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import mailchimp from "@mailchimp/mailchimp_marketing";
var HTTP_PORT = process.env.PORT || 3000;
import * as dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

const listId = process.env.MAILCHIMP_LISTID;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_APIKEY,
    server: process.env.MAILCHIMP_SERVER,
});

app.post("/", function (req, res) {       
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.inputEmail;
     
    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
    }

    const run = async () => {
        const response = await mailchimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
            status: "subscribed",
            merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
            }
        });
        res.sendFile(__dirname + "/success.html")
        console.log("Successfully added contact as an audience member. The contact's id is "+response.id+".");
        app.post("/success", function (req, res) {
            res.redirect("/");
        });
    };
    
    run().catch(e => {console.log(e);res.sendFile(__dirname + "/failure.html")});
    app.post("/failure", function (req, res) {
        res.redirect("/");
    });    
});

app.listen(HTTP_PORT, () => {
    console.log("Server is running on port 3000 or 8080.")
});

