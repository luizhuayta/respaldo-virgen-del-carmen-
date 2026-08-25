const {DataTypes} = require('sequelize');
const sequelize = require('../config/db.config');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    names: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    last_names: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true
});

Users.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(
            user.password,
            SALT_ROUNDS
        );
    }
});

Users.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    }
});

module.exports = Users;