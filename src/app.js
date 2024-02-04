const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer"); // Import the multer module
const app = express();
require("./db/conn");
const User = require("./models/register");
const Waste = require("./models/waste");

const port = process.env.PORT || 5000;
const static_path = path.join(__dirname, "./public/Frontend");

app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5500',
origin:'http://localhost:5000' }));


// const corsOptions = {
//     origin: 'http://localhost:5500', // Update with your actual frontend URL
//     optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// Set up Multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to diskStorage if you want to store files on disk

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit the file size to 5MB (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // Add file type validation if needed
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
        }
    },
}).single('photo'); // 'photo' should match the field name in your form

// Enable CORS for all routes with minimal configuration
app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/Frontend/index.html"));
});

app.post('/upload', upload, async (req, res) => {
    try {
        const { title, description } = req.body;

        const newWaste = new Waste({
            title,
            description,
            photo: req.file ? req.file.buffer.toString('base64') : null,
        });

        const savedWaste = await newWaste.save();

        res.status(201).json(savedWaste);
    } catch (error) {
        console.error('Error during Waste upload:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


app.get('/upload/all', async (req, res) => {
    try {
        const Wastes = await Waste.find();
        res.json(Wastes);
    } catch (error) {
        console.error('Error fetching Waste data:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        console.log("Hi I'm here");

        await newUser.save();

        res.status(201).send('User registered successfully!');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send('User is not found');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid email or password');
        }
        res.redirect('http://127.0.0.1:5500/src/public/Frontend/index.html')
        res.status(201).send('User login successfully!');
        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`Internal Server Error: ${err.message}`);
});


app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});