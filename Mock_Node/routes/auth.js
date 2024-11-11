const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../schemas/user')

const router = express.Router()

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingLogin = await User.findOne({ email });
        if (existingLogin) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const login = await User.findOne({ email })

        if (!login) {
            return res.status(404).json({ error: 'User doesnt exist' })
        }

        const isPasswordValid = await bcrypt.compare(password, login.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' })
        }

        res.status(200).json({ login })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router