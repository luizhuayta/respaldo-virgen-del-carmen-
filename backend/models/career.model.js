const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Career = sequelize.define('Career', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    history: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    mision: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    vision: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    values: {
        type: DataTypes.TEXT,
        allowNull: false
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
    tableName: 'career',
    timestamps: true
});

module.exports = Career;
