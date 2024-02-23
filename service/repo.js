const Contact = require('../model/Contact');
const { Op } = require('sequelize');

async function findContactByEmail(email) {
    return Contact.findAll({
        where: { email }
    });
}

async function findContactByPhonenumber(phonenumber) {
    return Contact.findAll({
        where: { phonenumber }
    });
}

async function findContactByEmailAndPhonenumber(email, phonenumber) {
    return Contact.findOne({
        where: {
            [Op.and]: [
                { email },
                { phonenumber }
            ]
        }
    });
}

async function findPrimaryContactByPhonenumber(phonenumber) {
    return Contact.findOne({
        where: { phonenumber, linkprecedence: 'primary' }
    });
}

async function findPrimaryContactByEmail(email) {
    return Contact.findOne({
        where: { email, linkprecedence: 'primary' }
    });
}

async function createContact({ email, phonenumber, linkedId, linkprecedence }) {
    return Contact.create({ email, phonenumber, linkedId, linkprecedence });
}

module.exports = {
    findContactByEmail,
    findContactByPhonenumber,
    findContactByEmailAndPhonenumber,
    findPrimaryContactByPhonenumber,
    findPrimaryContactByEmail,
    createContact
};
