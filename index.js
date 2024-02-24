const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const sequelize = require('./config/db');
const Contact = require('./model/Contact');
const {
    findContactByEmail,
    findContactByPhonenumber,
    findContactByEmailAndPhonenumber,
    findPrimaryContactByPhonenumber,
    findPrimaryContactByEmail,
    createContact
} = require('./service/repo');

const app = express();
app.use(bodyParser.json());

app.get('/getall', async (req, res) => {
    try {
        const allData = await Contact.findAll();

      
        res.json(allData);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.post('/identify', async (req, res) => {
    const { email, phoneNumber: phonenumber } = req.body;

    try {
        let response = {
            primaryContactId: '',
            emails: [],
            phonenumbers: [],
            secondaryContactIds: []
        };

        const commonEmail = await findContactByEmail(email);

        const commonPhonenumber = await findContactByPhonenumber(phonenumber);

        const alreadyExists = await findContactByEmailAndPhonenumber(email, phonenumber);

        const primaryPhone = await findPrimaryContactByPhonenumber(phonenumber);

        const primaryEmail = await findPrimaryContactByEmail(email);

        
        if (alreadyExists) {
            // Handle existing contact
            if (alreadyExists.linkprecedence === 'primary') {
                console.log("91");
                response.primaryContactId = alreadyExists.id;
                response.emails = [alreadyExists.email];
                response.phonenumbers = [alreadyExists.phonenumber];

                response.secondaryContactIds = [...new Set((await Contact.findAll({
                    where: { linkedId: alreadyExists.id },
                    attributes: ['id'],
                    raw: false
                })).map(contact => contact.id))];


            } else {
                console.log("109")
                console.log(alreadyExists);
                response.primaryContactId = alreadyExists.linkedId;
                response.emails = [...new Set([
                    ...(await Contact.findAll({
                        where: { linkedId: alreadyExists.linkedId },
                        attributes: ['email'],
                        raw: false
                    })).map(contact => contact.email),
                    ...(await Contact.findAll({
                        where: { id: alreadyExists.linkedId },
                        attributes: ['email'],
                        raw: false
                    })).map(contact => contact.email)
                ])];

                response.phonenumbers = [...new Set([
                    ...(await Contact.findAll({
                        where: { linkedId: alreadyExists.linkedId },
                        attributes: ['phonenumber'],
                        raw: false
                    })).map(contact => contact.phonenumber),
                    ...(await Contact.findAll({
                        where: { id: alreadyExists.linkedId },
                        attributes: ['phonenumber'],
                        raw: false
                    })).map(contact => contact.phonenumber)
                ])];

                response.secondaryContactIds = [...new Set((await Contact.findAll({
                    where: { linkedId: alreadyExists.linkedId },
                    attributes: ['id'],
                    raw: false
                })).map(contact => contact.id))];



            }
            console.log("122");
            console.log(response);
        } else {
            // Handle new contact
            if (primaryEmail && primaryPhone) {

                if (primaryEmail.createdAt < primaryPhone.createdAt) {
                    console.log("133")
                    const obj = await Contact.findByPk(primaryPhone.id);
                    await obj.update({ linkedId: primaryEmail.id, linkprecedence: 'secondary' });
                    response.primaryContactId = primaryPhone.id;
                    response.emails = [...new Set([...(await Contact.findAll({
                        where: { linkedId: primaryEmail.id },
                        attributes: ['email'],
                        raw: true
                    })).map(({ email }) => email), ...(await Contact.findAll({
                        where: { id: primaryEmail.id },
                        attributes: ['email'],
                        raw: true
                    })).map(({ email }) => email)])];

                    response.phonenumbers = [...new Set([...(await Contact.findAll({
                        where: { linkedId: primaryEmail.id },
                        attributes: ['phonenumber'],
                        raw: true
                    })).map(({ phonenumber }) => phonenumber), ...(await Contact.findAll({
                        where: { id: primaryEmail.id },
                        attributes: ['phonenumber'],
                        raw: true
                    })).map(({ phonenumber }) => phonenumber)])];

                    response.secondaryContactIds = [...new Set([...(await Contact.findAll({
                        where: { linkedId: primaryEmail.id },
                        attributes: ['id'],
                        raw: true
                    })).map(({ id }) => id)])];
                } else {
                    console.log("153");
                    const obj = await Contact.findByPk(primaryEmail.id);
                    await obj.update({ linkedId: primaryPhone.id, linkprecedence: 'secondary' });
                    response.primaryContactId = primaryEmail.id;
                    response.emails = [...new Set([...(await Contact.findAll({
                        where: { linkedId: primaryPhone.id },
                        attributes: ['email'],
                        raw: true
                    })).map(({ email }) => email), ...(await Contact.findAll({
                        where: { id: primaryPhone.id },
                        attributes: ['email'],
                        raw: true
                    })).map(({ email }) => email)])];

                    response.phonenumbers = [...new Set([...(await Contact.findAll({
                        where: { linkedId: primaryPhone.id },
                        attributes: ['phonenumber'],
                        raw: true
                    })).map(({ phonenumber }) => phonenumber), ...(await Contact.findAll({
                        where: { id: primaryPhone.id },
                        attributes: ['phonenumber'],
                        raw: true
                    })).map(({ phonenumber }) => phonenumber)])];
                    response.secondaryContactIds = (await Contact.findAll({
                        where: { linkedId: primaryPhone.id },
                        attributes: ['id'],
                        raw: true
                    })).map(({ id }) => id);
                }
            } else if (commonEmail.length > 0) {
                console.log("174")
                const primaryCommonEmail = await Contact.findOne({
                    where: { [Op.or]: [{ [Op.and]: [{ linkprecedence: 'primary' }, { email }] }, { id: commonEmail[0].linkedId }] }
                });
                if (phonenumber) {
                    console.log("179")
                    const contact = await Contact.create({
                        phonenumber,
                        email,
                        linkedId: primaryCommonEmail.id,
                        linkprecedence: 'secondary'
                    });
                    console.log(contact);
                }
                console.log("needed = 175")
                response.primaryContactId = primaryCommonEmail.id;
                response.emails = [...new Set([...(await Contact.findAll({
                    where: { linkedId: primaryCommonEmail.id },
                    attributes: ['email'],
                    raw: true
                })).map(({ email }) => email), primaryCommonEmail.email])].filter(res => res !== "" && res !== null);

                response.phonenumbers = [...new Set([...(await Contact.findAll({
                    where: { linkedId: primaryCommonEmail.id },
                    attributes: ['phonenumber'],
                    raw: true
                })).map(({ phonenumber }) => phonenumber), ...(await Contact.findAll({
                    where: { id: primaryCommonEmail.id },
                    attributes: ['phonenumber'],
                    raw: true
                })).map(({ phonenumber }) => phonenumber)])].filter(res => res !== "" && res !== null);

                response.secondaryContactIds = [...new Set([...(await Contact.findAll({
                    where: { linkedId: primaryCommonEmail.id },
                    attributes: ['id'],
                    raw: true
                })).map(({ id }) => id)])];

            } else if (commonPhonenumber.length > 0) {
                console.log("208")
                const primaryCommonPhonenumber = await Contact.findOne({
                    where: { [Op.or]: [{ [Op.and]: [{ linkprecedence: 'primary' }, { phonenumber }] }, { id: commonPhonenumber[0].linkedId }] }
                });
                if (email) {
                    console.log("213")
                    const contact = await Contact.create({
                        phonenumber,
                        email,
                        linkedId: primaryCommonPhonenumber.id,
                        linkprecedence: 'secondary'
                    });
                    console.log(contact);
                }
                console.log("needed = 214")
                response.primaryContactId = primaryCommonPhonenumber.id;
                console.log("218")
                console.log(primaryCommonPhonenumber.id)
                // Assuming this is within an async function
                // Assuming this is within an async function
                response.emails = [...new Set([...(await Contact.findAll({
                    where: { linkedId: primaryCommonPhonenumber.id },
                    attributes: ['email'],
                    raw: true
                })).map(({ email }) => email), primaryCommonPhonenumber.email])];



                response.phonenumbers = [...new Set([
                    ...(await Contact.findAll({
                        where: { linkedId: primaryCommonPhonenumber.id },
                        attributes: ['phonenumber'],
                        raw: true
                    })).map(({ phonenumber }) => phonenumber),
                    primaryCommonPhonenumber.phonenumber
                ])];

                response.secondaryContactIds = (await Contact.findAll({
                    where: { linkedId: primaryCommonPhonenumber.id },
                    attributes: ['id'],
                    raw: true
                })).map(({ id }) => id);
            } else {
                console.log("243")
                console.log(phonenumber);
                if (phonenumber && email) {
                    console.log("If");
                    const obj = await Contact.create({ email, phonenumber , linkprecedence: 'primary' });
                    response.primaryContactId = obj.id;
                    response.emails = [obj.email].filter(res => res !== "" && res !== null);
                    response.phonenumbers = [obj.phonenumber].filter(res => res !== "" && res !== null);
                    response.secondaryContactIds = [];

                }

                else {

                   res.json("New Contacts can not be null");
                   return;

                }
            }
        }

        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }

});


sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
});
