const express = require('express');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const path = require('path');
const multer = require('multer');
const cors = require('cors');
require("dotenv").config();
const port = 3019;

const app = express();
app.use(express.static(__dirname)); // Server static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Serve static files from the "public" folder

// Connect to MongoDB
mongoose.connect('mongodb+srv://test1:abc%40123@houseprice.alfaq.mongodb.net/store_data', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connection successful");
});
 
// Multer Storage Setup (local storage for images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store images in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate unique filename
    }
});

const upload = multer({ storage });

// Define the user schema and model
const userSchema = new mongoose.Schema({
    name: String,
    phone_no: String,
    email: String,
    password: String,
});

const Users = mongoose.model("Register_data", userSchema);

// Property Schema and Model
const propertySchema = new mongoose.Schema({
    index: { type: Number, unique: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    squareFeet: { type: Number, required: true },
    floor: { type: String, required: true },
    furnishing: { type: String, required: true },
    address: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    parkings: { type: Number, required: true },
    balconies: { type: Number, required: true },
    facing: { type: String, required: true },
    propertyType: { type: String, required: true },
    imageUrl: { type: String },
});

propertySchema.plugin(AutoIncrement, { inc_field: 'index', start_seq: 1 });
const Property = mongoose.model('Add-Property', propertySchema);

// Serve the registration form
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration-form.html'));
});

// Handle form submission for registration
app.post('/post', async (req, res) => {
    try {
        const { name, phone_no, email, password } = req.body;

        // Check if the email already exists
        const existingUser = await Users.findOne({ email: email });

        if (existingUser) {
            return res.send(`
                <script>
                    alert('This email is already registered.');
                    window.location.href = '/signin';
                </script>
            `);
        }

        // Create a new user if email is unique
        const user = new Users({ name, phone_no, email, password });
        await user.save();

        res.send(`
            <script>
                alert('Registration successful!');
                window.location.href = '/signin';
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`
            <script>
                alert('Error during registration. Please try again.');
                window.location.href = '/signin';
            </script>
        `);
    }
});

// Handle sign-in request
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email: email });

        if (!user) {
            return res.send(`
                <script>
                    alert('Email not found. Please register first.');
                    window.location.href = '/signin';
                </script>
            `);
        }

        if (user.password !== password) {
            return res.send(`
                <script>
                    alert('Incorrect password.');
                    window.location.href = '/signin';
                </script>
            `);
        }

        res.send(`
            <script>
                alert('Sign-in successful!');
                window.location.href = 'index.html'; // Redirect to home page or dashboard
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send(`
            <script>
                alert('Error during sign-in. Please try again.');
                window.location.href = '/signin';
            </script>
        `);
    }
});

// Image Upload Route
app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image upload failed' });
    }
    const imageUrl = `http://localhost:3019/uploads/${req.file.filename}`;
    res.json({ imageUrl }); // Send back the image URL
});

// Handle property form submission with Image Upload
app.post('/add-property', upload.single('image'), async (req, res) => {
    try {
        const {
            description,
            budget,
            state,
            city,
            squareFeet,
            floor,
            furnishing,
            address,
            bedrooms,
            bathrooms,
            parkings,
            balconies,
            facing,
            propertyType,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Image upload required' });
        }

        // Retrieve the last inserted property based on the highest index
        const lastProperty = await Property.findOne().sort({ index: -1 }).limit(1);
        let newIndex = 1; // Default to 1 if no properties exist
        if (lastProperty) {
            newIndex = lastProperty.index + 1; // Increment index from the last property
        }

        // Store the image URL in the property collection
        const imageUrl = `http://localhost:3019/uploads/${req.file.filename}`;

        // Create the new property document with the incremented index
        const property = new Property({
            description,
            budget,
            state,
            city,
            squareFeet,
            floor,
            furnishing,
            address,
            bedrooms,
            bathrooms,
            parkings,
            balconies,
            facing,
            propertyType,
            imageUrl,
            index: newIndex, // Assign the calculated index
        });

        // Save the new property
        await property.save();
        res.status(201).json({ message: "Property added successfully!", index: property.index, imageUrl });
    } catch (error) {
        console.error("Error adding property:", error);
        res.status(500).json({ error: "Failed to add property." });
    }
});

// Define Schema and Model
const PropertySchema = new mongoose.Schema({
    budget: Number,
    propertyType: String,
    city: String,
    facing: String
}, { collection: "properties" });

const Properties = mongoose.model("properties", PropertySchema);

// API Route to Fetch Filtered Data
app.get("/store_data/properties", async (req, res) => {
    try {
        const { budget, propertyType, city } = req.query;

        let filter = {};
        if (budget) {
            const budgetRanges = {
                "1": { $lte: 5000000 },
                "2": { $gte: 5100000, $lte: 10000000 },
                "3": { $gte: 10000000, $lte: 20000000 },
                "4": { $gte: 20000000, $lte: 50000000 },
                "5": { $gte: 50000000 },
            };
            filter.budget = budgetRanges[budget];
        }
        if (propertyType) filter.propertyType = propertyType;
        if (city) filter.city = city;

        console.log(filter);

        const properties = await Property.find(filter, { budget: 1, propertyType: 1, city: 1, _id: 0 });

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
