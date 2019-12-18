const express = require('express');
const app = express();

app.use(express.json());

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://3000-ed48df35-0d36-49cf-95f7-534859f2eb39.ws-us02.gitpod.io"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
//     next();
// });

// // Define Routes
app.use('/api/search', require('./routes/search'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
