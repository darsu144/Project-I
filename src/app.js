const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const app = express();

require("./db/conn");
const User = require("./models/register");
const Waste = require("./models/waste");

const port = process.env.PORT || 5000;
const static_path = path.join(__dirname, "./public/Frontend");

app.use(express.static(static_path));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Middleware to set the Content-Type header for CSS files
app.use((req, res, next) => {
  if (req.url.endsWith(".css")) {
    res.header("Content-Type", "text/css");
  }
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
}).single("photo");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/Frontend/index.html"));
});

app.post("/upload", cors(), upload, async (req, res) => {
  try {
    const { title, description, email } = req.body;

    const newWaste = new Waste({
      title,
      description,
      email,
      photo: req.file ? req.file.buffer.toString("base64") : null,
    });

    const savedWaste = await newWaste.save();

    res.status(201).json(savedWaste);
  } catch (error) {
    console.error("Error during Waste upload:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

app.get("/upload/all", cors(), async (req, res) => {
  try {
    const Wastes = await Waste.find();
    res.json(Wastes);
  } catch (error) {
    console.error("Error fetching Waste data:", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

app.delete("/upload/:id", cors(), async (req, res) => {
  try {
    const id = req.params.id;
    await Waste.findByIdAndDelete(id);
    res.status(200).send("Waste deleted successfully");
  } catch (error) {
    console.error("Error deleting waste:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.put("/upload/:id", cors(), upload, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;
    let photo = req.body.photo; // Assuming the photo is sent as a base64 string
    if (req.file) {
      // If a new photo file is uploaded, set the photo variable to the file buffer
      photo = req.file.buffer.toString("base64");
    }
    const updatedWaste = await Waste.findByIdAndUpdate(
      id,
      { title, description, photo },
      { new: true }
    );
    res.json(updatedWaste);
  } catch (error) {
    console.error("Error updating waste:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.post("/register", cors(), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email is already in use");
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.post("/login", cors(), async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    await User.findOne({ email })
      .then((data) => {
        console.log(data);
        res.redirect("http://localhost:5500/src/public/Frontend/");
      })
      .catch((err) => {
        console.log(err);
      });

    // if (password !== user.password) {
    //     return res.status(401).send('Invalid email or password');
    // }
   
  } catch (error) {
    console.error("Error during login:", error);
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
