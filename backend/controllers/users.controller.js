const db = require('../models');
const builUsersQuery = require('../helpers/users.query');

exports.createUsers = async (req, res) => {
    try {
        const { names, last_names, username, password, description } = req.body;

        if (!names || !last_names || !username || !password)
            return res.status(400).json({ error: 'Complete los campos obligatorios.' });

        const newUser = await db.Users.create({
            names,
            last_names,
            username,
            password,
            description
        });

        const { password: _password, ...userWithoutPassword } = newUser.toJSON();

        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.getUsers = async (req, res) => {
    try {
        const query = builUsersQuery(
            {},
            [['createdAt', 'ASC']]
        );
        query.attributes = { exclude: ['password'] };
        const users = await db.Users.findAll(query);
        res.status(200).json(users);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { names, last_names, username, description } = req.body;

    try {
        const users = await db.Users.findByPk(id);

        if (!users)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        users.names = names;
        users.last_names = last_names;
        users.username = username;
        users.description = description;

        await users.save();

        const { password: _password, ...userWithoutPassword } = users.toJSON();

        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const user = await db.Users.findOne({ where: { id } });

        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        if (del === '0') {
            await user.update({ status: false });
            fmessage = 'Usuario archivado/desactivado correctamente.'
        } else if (del === '1') {
            await user.destroy();
            fmessage = 'Usuario eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}
