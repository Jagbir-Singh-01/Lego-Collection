require('dotenv').config();
const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 

const userSchema = new Schema({
    userName:{ 
        type: String,
        unique: true, 
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User;

initialize = () => {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err) => {
        reject(err);
    });

    db.once('open', () => {
        User = db.model("users", userSchema); 
        resolve();
    });
});
}

registerUser = (userData) => {
    return new Promise((resolve, reject) => {

        bcrypt.hash(userData.password, 10)
            .then(hash => {
                userData.password = hash;

                let newUser = new User(userData);

                newUser.save()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject("User Name already taken"); 
                        } else {
                            reject("There was an error creating the user: " + err);
                        }
                    });
            })
            .catch(err => {
                reject("There was an error encrypting the password: " + err); 
            });
    });
}


checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    reject("Unable to find user: " + userData.userName);
                    return; 
                }

                const user = users[0]; 

                bcrypt.compare(userData.password, user.password)
                    .then(result => {
                        if (result) {
                            resolve(user); 
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    })
                    .catch(err => {
                        reject("Error comparing passwords: " + err); 
                    });
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
}

module.exports = { initialize, registerUser, checkUser}