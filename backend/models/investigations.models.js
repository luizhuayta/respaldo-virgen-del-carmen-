const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Investigations = sequelize.define('Investigations', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    publication_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    pdf_url: {
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
    tableName: 'investigations',
    timestamps: true
});

module.exports = Investigations;
