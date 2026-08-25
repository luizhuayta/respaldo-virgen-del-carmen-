const {DataTypes} = require('sequelize');
const sequelize = require('../config/db.config');

const PressReleases = sequelize.define('Press_Release', {
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
    img_url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    press_release: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'press_releases',
    timestamps: true
});

module.exports = PressReleases;