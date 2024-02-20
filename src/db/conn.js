const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://anupadhikari259:anup123@cluster0.g10m6qg.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(`Connection Successful`);
}).catch((error) => {
    console.error('Connection Error:', error);
});
