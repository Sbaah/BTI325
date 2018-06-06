const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
let Schema = mongoose.Schema;

var userSchema = new Schema({
    "user": {
        type: String,
        unique: true
    },
    "password": String
});
let User;

module.exports = {
    initialize() {
        return new Promise(function (resolve, reject) {
            // connection details
            // var opts = { server: { auto_reconnect: false }, user: '', pass: '' };
            // let db = mongoose.createConnection('mlab address here', 'bti325', "port", opts);
            db.on('error', (err) => {
                reject(err);
            });
            db.once('open', () => {
                User = db.model("users", userSchema);
                resolve();
            });
        });
    },
    registerUser(userData) {
        return new Promise(function (resolve, reject) {
            let newUser;
            User.find({ user: userData.user })
                .exec()
                .then((user) => {
                    if (user.length > 0) {   // user exists
                        reject("User Name already taken"); // I used a string instead of the 11000
                    }
                    else if (userData.password != userData.password2) {
                        reject("Passwords do not match");
                    }
                    else if (userData.password == userData.password2) // passwords much
                    {
                        bcrypt.genSalt(10, (err, salt) => { // Generate a "salt" using 10 rounds
                            bcrypt.hash(userData.password, salt) // using example with promises from npm page
                                .then((hash) => {
                                    userData.password = hash;
                                    newUser = new User(userData);
                                    newUser.save((err) => {
                                        if (err) {
                                            console.log("\nThere was an error saving\n");
                                        } else {
                                            console.log("\nUser was saved\n");
                                        }
                                    })
                                        .then(() => (resolve(user[0])))
                                        .catch((err) => {
                                            console.log(err);
                                            reject(err);
                                        });
                                })
                                .catch((err) => {
                                    reject("There was an error encrypting the password");
                                })
                        });
                    }
                    else
                        reject("User Name already taken");
                })
                .catch((err) => { reject(err) });
        });
    },
    updatePassword(userData) {
        return new Promise(function (resolve, reject) {
            if (userData.password === userData.password2) {
                bcrypt.genSalt(10, (err, salt) => { // Generate a "salt" using 10 rounds
                bcrypt.hash(userData.password, salt) // using example with promises from npm page
                        .then((hash) => {
                            userData.password = hash; // set new password
                            User.update({ user: userData.user },  // for user 
                                { $set: { password: hash } },   // update password
                                { multi: false })
                                .exec()
                                .then(() => {
                                    resolve();
                                })
                                .catch((err) => { reject("There was an error updating the password for user" + userData.user + " " + err) });
                        })
                        .catch((err) => {
                            reject("Error: " + err);
                        });
                });
            }
            else {
                reject("Passwords do not match");
            }
        });
    },
    checkUser(userData) {
        return new Promise(function (resolve, reject) {
            User.find({ user: userData.user })
                .exec()
                .then((user) => {
                    if (user.length > 0) {  // check if there is a user with this name
                        bcrypt.compare(userData.password, user[0].password)
                            .then((res) => {
                                if (res === true) {
                                    // if it matches
                                    resolve(user[0]);
                                }
                                else {
                                    reject("Incorrect Password for user: " + userData.user);
                                }
                            });
                    }
                    else {
                        // user doesn't exist
                        reject("Unable to find user: " + userData.user);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
};