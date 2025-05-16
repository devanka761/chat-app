const firebase = require('firebase-admin');

const serviceAccount = require('../config/firebase-adminsdk.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://chat-app-34cb9-default-rtdb.firebaseio.com'
});

module.exports = firebase.database();