// External imports
const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

// Internal imports
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT;

const NODE_ENV = process.env.NODE_ENV || "dev";

if (NODE_ENV === "dev") {
    app.use(morgan("dev"));
}

const corsOptions = {
    origin: ['http://localhost:5174', 'http://localhost:5175'],
    optionSuccessStatus: 200,
    credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('API is live...');
})

try {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
} catch (err) {
    process.exit(1);
}