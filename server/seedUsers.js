const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User'); // adjust path if needed

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const users = [
            {
                username: "admin",
                password: "password123",
                fullName: "System Administrator",
                role: "Admin"
            },
            {
                username: "staff1",
                password: "password123",
                fullName: "John Staff",
                role: "Staff"
            }
        ];

        for (const user of users) {
            const exists = await User.findOne({ username: user.username });
            if (exists) {
                console.log(`Skipping: ${user.username} already exists`);
                continue;
            }

            await User.create(user); // password will auto-hash
            console.log(`Created: ${user.username}`);
        }

        console.log("Done");
        process.exit();

    } catch (err) {
    console.error("SEED ERROR:", err.message);
    console.error("FULL ERROR:", err);
    process.exit(1);
}
}

seed();
