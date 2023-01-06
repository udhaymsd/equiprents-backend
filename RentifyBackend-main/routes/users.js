const express = require('express');
const mongodb = require('mongodb');
const client = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const nodemailer = require('nodemailer');


//-------------------TOC-------------------
// 3.Users ("/users",get,put)
//-------------------END OF TOC-------------------


const dburl = process.env.DB_URL || "mongodb://localhost:27017";
//const dburl = "mongodb://localhost:27017";

let router = express.Router();

router.get("/", async(req, res) => {
    try {
        let connection = await client.connect(dburl, { useUnifiedTopology: true });
        let db = connection.db('rental');
        let data = await db.collection('users').find().project({ "_id": 1, "username": 1, "email": 1, "role": 1 }).toArray();
        if (data) {
            res.status(200).json({ results: data, status: 200, message: "User Data Fetched" });
        } else {
            res.status(400).json({ status: 400, message: "Issues while fetching user data!!" });
        }
        await connection.close();
    } catch (error) {
        res.status(403).json({ status: 400, message: "Fetching User Data Failed!!" });
        console.log("Failed fetching user data")
    }
})

router.put("/:id", async(req, res) => {
    try {
        let connection = await client.connect(dburl, { useUnifiedTopology: true });
        let db = connection.db('rental');
        let userdata = await db.collection('users').find({ "_id": mongodb.ObjectId(req.params.id) }).toArray();
        let data = await db.collection('users').updateOne({ "_id": mongodb.ObjectId(req.params.id) }, { $set: req.body })
        if (data) {
            sendEmail(userdata[0], req.body.role);
            res.status(200).json({ status: 200, message: "User role updated" });

        } else {
            res.status(400).json({ status: 400, message: "Issues while updating user role!!" });
        }
        await connection.close();
    } catch (error) {
        res.status(403).json({ status: 400, message: "Updating User role Failed!!" });
        console.log("Failed updating user role")
    }
})

const sendEmail = (userdata, newrole) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: "krishnakireeti.mamidi@gmail.com",
            to: "krishnakiriti.mamidi@outlook.com",
            subject: "User role change notification",
            html: `<div>
                <p>Hello Krishna,</p>

                <p>Role of our customer ${userdata.username} is changed to ${newrole} </p>

                 <p>Updated details of the user</p>                    

                <p> <b>Name</b> : ${userdata.username}</p> 
                <p> <b>Email</b> : ${userdata.email}</p> 
                <p> <b>Role</b> : ${newrole}</p> 

                <p>Regards,</p>
                <p>Team Rentify</p>
                </div>`
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Error while sending mail", err.message);
                // res.status(401).json({ status: 401, message: "Error occured while sending mail" })
            } else {
                //res.status(200).json({ status: 200, message: "Email sent !!" })
                console.log("Mail sent!!")
            }
        })
    } catch (error) {
        console.log("Error while sending role change mail", error);
        //res.status(400).json({ status: 400, message: "Error while sending mail !!" })
    }
}

module.exports = router;