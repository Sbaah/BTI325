const mongoose = require('mongoose');
mongoose.Promise = ('bluebird');
let Schema = mongoose.Schema;

var commentSchema = new Schema({
    "authorName": String,
    "authorEmail": String,
    "subject": String,
    "commentText": String,
    "postedDate": Date,
    "replies": [{
        "comment_id": String,
        "authorName": String,
        "authorEmail": String,
        "commentText": String,
        "repliedDate": Date
    }]
});
let Comment;

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
                Comment = db.model("comments", commentSchema);
                resolve();
            });
        });
    },
    addComment(data) {
        return new Promise(function (resolve, reject) {
            data.postedDate = Date.now();
            let newComment = new Comment(data);
            newComment.save((err) => {
                if (err) {
                    console.log("\nThere was an error saving\n");
                } else {
                    console.log("\nComment was saved\n");
                }
            })
                .then(() => (resolve(newComment._id)))
                .catch((err) => {
                    reject(err);
                });

        });
    },
    getAllComments() {
        return new Promise(function (resolve, reject) {
            Comment.find({}).sort({ postedDate: -1 })
                .exec(function (err, docs) {
                    if (!err) {
                        console.log(docs);                        
                    } else { throw err; }
                })
                .then((comments) => (resolve(comments)))
                .catch((err) => {
                    reject(err);
                });
        });
    },
    addReply(data) {
        return new Promise(function (resolve, reject) {
            data.repliedDate = Date.now();
            Comment.update(
                {_id: data.comment_id},
                { $addToSet: { replies: data } })
                .exec()
                .then(() => (
                    console.log(id),
                    resolve()))
                .catch((err) => {
                    reject(err);
                });
        });
    }
};