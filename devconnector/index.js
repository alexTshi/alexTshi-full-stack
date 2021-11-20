const express = require("express");
const PORT = process.env.PORT || 4000;
const connectDB = require("./config/db");
const path = require("path");
const app = express();

//Connect Database
connectDB();
//Init Middleware
app.use(express.json());

//Define Routes
app.use("/api/users", require("./routes/api/users") );
app.use("/api/profile", require("./routes/api/profile") );
app.use("/api/posts", require("./routes/api/posts") );
app.use("/api/auth", require("./routes/api/auth") );

//Serve Static assets in production
if(process.env.NODE_ENV !== 'production'){
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    });
}
app.listen(PORT, () => console.log(`Server is listening on Port ${PORT}`));