const express = require("express")
const PORT = process.env.PORT || 3000
const connectDB = require("./config/db")

const app = express()
//Connect Database
connectDB()
//Init Middleware
app.use(express.json())

app.get('/', (req, res) => res.send("API is running.") )

//Define Routes
app.use("/api/users", require("./routes/api/users") )
app.use("/api/profile", require("./routes/api/profile") )
app.use("/api/posts", require("./routes/api/posts") )
app.use("/api/auth", require("./routes/api/auth") )

app.listen(PORT, () => console.log(`Server is listening on Port ${PORT}`));