const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://darshan:darshan123@cluster0.vjqrhvx.mongodb.net/darshan", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(`Connection Successful`);
}).catch((error) => {
    console.error('Connection Error:', error);
});
