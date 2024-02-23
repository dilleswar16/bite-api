const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    phonenumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    linkprecedence: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: 'contacts'
});

module.exports = Contact;
