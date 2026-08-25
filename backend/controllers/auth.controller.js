const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await db.Users.findOne({ where: { username } });

        if (!user)
            return res.status(401).json({ message: 'Credenciales inválidas' });

        if (!user.status)
            return res.status(403).json({ message: 'Usuario desactivado' });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid)
            return res.status(401).json({ message: 'Credenciales inválidas' });

        // TOKEN (1 hora)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno' });
    }
};