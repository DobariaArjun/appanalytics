const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const isEmpty = require('is-empty');
const gcm = require('node-gcm');
const app = express();

const uri = "mongodb+srv://ArjunDobaria:Pravin143@mantratechnolog.bjxu8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const sender = new gcm.Sender('AAAAVpFD8ww:APA91bE-k8H9mXHaf_ilc_dUHAKsQABeWwVhtJd_4D1NLOAxy8N04nqLoN8k-S2-YuJSutyjmTZsyhbKvU1gcpcex9iSWJktJn_4Yf5F3GPal-6k4TQX3B31lGHiUpidQuLC3nO9v9Ky');

client.connect((err, db) => {
    if (err)
        console.log("Error while connecting to Mongo" + err);
    else {
        console.log("Connected to Mongo");
        let dbo = db.db("TritechTechnoPoint");

        app.post('/firstCall', (req, res) => {
            let tempratureChecker = req.body.appName;
            let dataCounter = dbo.collection(tempratureChecker).find({
                'DeviceToken': req.body.deviceToken
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    //Create New
                    let myObj = {
                        UserCountry: req.body.userCountry,
                        DeviceBrand: req.body.brand,
                        DeviceToken: req.body.deviceToken,
                        AppVersion: req.body.appVersion,
                        ScreenResolustion: req.body.screenResolution
                    };

                    dbo.collection(tempratureChecker).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({
                                status: "0",
                                message: "Inserting fail in " + tempratureChecker
                            });
                        else {
                            res.json({
                                status: "1",
                                message: "Data added successfully in " + tempratureChecker
                            });
                        }
                    });
                } else {
                    dbo.collection(tempratureChecker).updateOne(
                        {
                            'DeviceToken': req.body.deviceToken
                        },
                        {
                            $set: {
                                "UserCountry": req.body.userCountry,
                                "DeviceBrand": req.body.brand,
                                "AppVersion": req.body.appVersion,
                                "ScreenResolustion": req.body.screenResolution
                            }
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({
                                status: "1",
                                message: "Data updated successfully in " + tempratureChecker
                            });
                        else
                            res.json({
                                status: "0",
                                message: "Updating fail in " + tempratureChecker
                            });
                    }).catch((err) => {
                        res.json({
                            status: "0",
                            message: "Updating fail in " + tempratureChecker
                        });
                    });
                }
            });
        });

        app.post('/activityView', (req, res) => {
            let tempratureCheckerActivityView = req.body.appNameView;
            let dataCounter = dbo.collection(tempratureCheckerActivityView).find({
                'ActivityName': req.body.name
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    //Create New
                    let myObj = {
                        ActivityName: req.body.name,
                        ActivityView: 1
                    };

                    dbo.collection(tempratureCheckerActivityView).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({
                                status: "0",
                                message: "Inserting fail in " + tempratureCheckerActivityView
                            });
                        else {
                            res.json({
                                status: "1",
                                message: "Data added successfully in " + tempratureCheckerActivityView
                            });
                        }
                    });
                } else {
                    var ActivityView = data[0]['ActivityView'];
                    dbo.collection(tempratureCheckerActivityView).updateOne(
                        {
                            'ActivityName': req.body.name
                        },
                        {
                            $set: {
                                "ActivityView": ActivityView + 1
                            }
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({
                                status: "1",
                                message: "Data updated successfully in " + tempratureCheckerActivityView
                            });
                        else
                            res.json({
                                status: "0",
                                message: "Updating fail in " + tempratureCheckerActivityView
                            });
                    }).catch((err) => {
                        res.json({
                            status: "0",
                            message: "Updating fail in " + tempratureCheckerActivityView
                        });
                    });
                }
            });
        });

        app.post('/notification', (req, res) => {
            let tempratureChecker = req.body.appName;
            var DeviceTokenArray = []
            let dataCounter = dbo.collection(tempratureChecker).find({
                'UserCountry': req.body.userCountry
            }).toArray();
            dataCounter.then((data) => {
                if (isEmpty(data)) {
                    res.json({
                        status: "0",
                        message: "No user available in this country"
                    });
                } else {
                    for (i = 0; i < data.length; i++) {
                        DeviceTokenArray.push(data[i]["DeviceToken"])
                    }
                    var message = new gcm.Message({
                        priority: 'high',
                        notification: {
                            title: req.body.title,
                            body: req.body.body
                        }
                    });
                    sender.send(message, {registrationTokens: DeviceTokenArray}, function (err, response) {
                        if (err) console.error(err);
                        else {
                            res.json({
                                status: "1",
                                message: response
                            });
                        }
                    });
                }
            });
        });

        app.get('/', (req, res) => {
            res.json({
                status: "1",
                message: "Server is running..!"
            });
        });
    }
});

let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});