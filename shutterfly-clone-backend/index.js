// External imports
const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();

// Internal imports
const routes = require('./routes/index');
const configurePassport = require('./config/passport');

const app = express();
const port = process.env.PORT;

const NODE_ENV = process.env.NODE_ENV || "dev";

if (NODE_ENV === "dev") {
    app.use(morgan("dev"));
}

const corsOptions = {
    origin: [process.env.FRONTEND_URL],
    optionSuccessStatus: 200,
    credentials: true,
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('API is live...');
})

configurePassport();

try {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
} catch (err) {
    process.exit(1);
}