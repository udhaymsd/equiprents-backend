const express = require('express');
const mongodb = require('mongodb');
const client = mongodb.MongoClient;
const dotenv = require("dotenv").config();
//const nodemailer = require('nodemailer');


//-------------------TOC-------------------
//1. Orders (get, post)
//-------------------END OF TOC-------------------


const dburl = process.env.DB_URL || "mongodb://localhost:27017";
//const dburl = "mongodb://localhost:27017";

let router = express.Router();
//api for fetching all orders by admin
router.get("/", async(req, res) => {
    try {
        let connection = await client.connect(dburl, { useUnifiedTopology: true });
        let db = connection.db('rental');
        let data = await db.collection('orders').find().toArray();
        if (data) {
            res.status(200).json({ results: data, status: 200, message: "Orders Data Fetched" });
        } else {
            res.status(400).json({ status: 400, message: "Issues while fetching orders' data!!" });
        }
        await connection.close();
    } catch (error) {
        res.status(403).json({ status: 400, message: "Fetching Orders Data Failed!!" });
        console.log("Failed fetching orders data")
    }
})

//api for fetching individual users orders
router.get("/:userId", async(req, res) => {
    try {
        let connection = await client.connect(dburl, { useUnifiedTopology: true });
        let db = connection.db('rental');
        let data = await db.collection('orders').find({ "userId": req.params.userId }).toArray();
        if (data.length !== 0) {
            res.status(200).json({ results: data, status: 200, message: "Orders Data Fetched" });
        } else if (data.length === 0) {
            res.status(200).json({ results: [], status: 400, message: "Issues while fetching orders' data!!" });
        }
        await connection.close();
    } catch (error) {
        res.status(403).json({ status: 400, message: "Fetching Orders Data Failed!!" });
        console.log("Failed fetching orders data")
    }
})


router.post("/", async(req, res) => {
    try {
        let connection = await client.connect(dburl, { useUnifiedTopology: true })
        let db = connection.db('rental');
        let data = await db.collection('orders').insertOne(req.body);
        if (data) {
            res.json({
                status: 200,
                message: "New Order added"
            })
        } else {
            res.json({
                status: 401,
                message: "Some Issue while inserting the order!!"
            })
        }
        connection.close();
    } catch (error) {
        res.json({ status: 401, message: "Catched the error while inserting order" })
    }
})

module.exports = router;