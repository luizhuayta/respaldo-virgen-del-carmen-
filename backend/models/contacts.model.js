const {DataTypes} = require('sequelize');
const sequelize = require('../config/db.config');

const Contacts = sequelize.define('Contacts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    phone: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    facebook: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    instagram: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tiktok: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'contacts',
    timestamps: true
});

module.exports = Contacts;
