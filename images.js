require('dotenv').config(); //process.env.WEBHOOK_URL
const sharp = require('sharp');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { WOMClient, Metric } = require('@wise-old-man/utils');
const client = new WOMClient({
    apiKey: `${process.env.API_KEY}`,
    userAgent: 'Toids'
  });
const group_id = 1219;
let membersGlobal = [];
const directoryPath = 'VengIcons/Pets/test';
const transformedPath = path.join(__dirname, 'VengIcons/Pets/transformed/');
const petOwnerPath = path.join(__dirname, 'VengIcons/Pets/');
const canvasPath = path.join(__dirname, 'VengIcons/');
const rolePath = path.join(__dirname, 'VengIcons/Roles');
const embedsObject = {};
const various = require('./various.json');
const { start } = require('repl');
let petOwnersTemplate = {
    'KaiserBruno': { 'amt': 0, 'icons': {}, 'type': '', 'role': '' },
    'King Slime': { 'amt': 0, 'icons': {}, 'type': '', 'role': '' },
    'Agv': { 'amt': 0, 'icons': {}, 'type': '', 'role': '' },
    'Gunzyx': { 'amt': 0, 'icons': {}, 'type': '', 'role': '' },
};
let petOwners = {};
let petOwnersXtra = {
    'SuperVegeto': {
        'amt': 23, 'obtainable': 0, 'icons': {
            "Chaos Ele.png": 1,
            "Supreme.png": 1,
            "Graardor.png": 1,
            "Baby Mole.png": 1,
            "Prince Dragon.png": 1,
            "Smoke Devil.png": 1,
            "Kraken.png": 1,
            "Snakeling.png": 1,
            "Chompy.png": 1,
            "Tzrek-Jad.png": 1,
            "Hellpuppy.png": 1,
            "Heron.png": 1,
            "Rock Golem.png": 1,
            "Beaver.png": 1,
            "Rift Guardian.png": 1,
            "Rocky.png": 1,
            "Olmlet.png": 1,
            "Skotos.png": 1,
            "Vorki.png": 1,
            "Lil' Zik.png": 1,
            "Ikkle Hydra.png": 1,
            "Sraracha.png": 1,
            "Nexling.png": 1
        }, 'type': '', 'role': 'quester'
    }
}


const initializeCSV = async () => {
    if (!membersGlobal.length) { // Check if the members data is not already fetched
        const csv = await client.groups.getMembersCSV(1219);
        membersGlobal = parseCSV(csv); // Store the result in the global variable
    }
    return membersGlobal;
};

function parseCSV(csvString) {
    const lines = csvString.split('\n');
    const result = [];

    lines.forEach((line, index) => {
        if (index > 0) { // Skip the header line
            let [player, role] = line.split(',');
            player = player.toLowerCase();
            const playerObject = {};
            playerObject[player.trim()] = role.trim(); // Trim spaces and store the role
            playerObject[player] = role;
            result.push(playerObject);
        }
    });
    return result;
}
const getRole = async (playerName) => {
    try {
        const members = await initializeCSV();
        const member = await members.find(obj => obj.hasOwnProperty(playerName.toLowerCase()));
        //console.log(member[playerName])
        const memberRole = member[playerName.toLowerCase()];
        return memberRole;
    } catch (error) {
        console.error('An error occurred:', error);
        return "guest";
    }
}



const iteratePets = async (petOwner) => {
    //pets{} id:file
    //directoryPathEnd 
    //path.join(directoryPathEnd, pet)
    try {

        let petObtainable = 0;
        const url = `https://api.collectionlog.net/collectionlog/user/${petOwner}`
        const response = await axios.get(url);
        const typeData = response.data.collectionLog.accountType;
        const petList = various.petFiles;
        const helmList = various.titles;
        const roleList = various.role_icons;
        const accountType = helmList[typeData.toLowerCase()];
        petOwnersTemplate[petOwner].type = accountType;
        const roleMatch = await getRole(petOwner.toLowerCase());
        const role = petOwner === "SuperVegeto" ? petOwnersTemplate[petOwner].role : getRole(petOwner);  //roleList[roleMatch];
        petOwnersTemplate[petOwner].role = role;
        const allPets = response.data.collectionLog.tabs.Other['All Pets'];
        let petCount = 0;
        for (const pet in allPets.items) {
            petObtainable++;
            if (allPets.items[pet].obtained) {
                let petFile = petList[allPets.items[pet].id];
                petOwnersTemplate[petOwner].icons[petFile] = allPets.items[pet].quantity;
                petCount++;
            }
        }
        for (const key of Object.keys(petOwnersXtra)) {
            petOwnersTemplate[key] = petOwnersXtra[key];
            petOwnersTemplate[key].obtainable = petObtainable;
        }

        petOwnersTemplate[petOwner].obtainable = petObtainable;
        petOwnersTemplate[petOwner].amt = petCount;
        petOwners = petOwnersTemplate;

        //return console.log(JSON.stringify(petOwners, null, 2));
    } catch (error) {
        console.error(error);
    }
}
const startIteratingPets = async (petOwner) => {
    for (const petOwner in petOwnersTemplate) {
        await iteratePets(petOwner);
    };
    return petOwners;
}



function collageImage() {

    // Create an empty image with a white background
    const combinedImage = sharp({
        create: {
            width: 50, // Width of the final image
            height: 50, // Height of the final image
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
    });


    // Composite the icons onto the empty image
    const compositeIcons = icons.map((icon, index) => ({
        input: icon,
        left: (index % 10) * 100, // Adjust position as needed
        top: Math.floor(index / 10) * 100 // Adjust position as needed
    }));

    // Combine the icons and save the final image
    combinedImage
        .composite(compositeIcons)
        .toFile(`Vengicons/${icons[0]}.png`, (err, info) => {
            if (err) throw err;
            console.log('Icons have been combined:', info);
        });
}

function capitalizeWords(str) {
    let temp = str.replace('_', ' ');
    return temp.replace(/\b(?<!')\w/g, function (char) {
        return char.toUpperCase();
    });
}

const replaceUnder = async () => {
    try {
        const files = await fs.promises.readdir(directoryPathEnd);
        //console.log(JSON.stringify(files, null, 2));
        files.forEach(file => {
            const filePath = path.join(directoryPathEnd, file);
            const newFileName = file.replace(" ", '_');
            const newFilePath = path.join(directoryPathEnd, `${newFileName}`);
            fs.promises.rename(filePath, newFilePath, (err) => {
                if (err) {
                    console.error(`Error with file name: ${err}`);
                    return;
                }
                else {
                    console.log(`Renamed file: ${file} to ${newFileName}`);
                }
            });
        });

    } catch (error) {
        console.error(error);
    }
}

function formatRole(role) {
    // Split the role string into words
    let words = role.split('_');

    // Capitalize each word and join them with underscores
    let formattedRole = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_');

    // Append the .png extension
    formattedRole += '.png';
    //console.log(formattedRole)
    return formattedRole;
}


const obtainedBuffer = async (petOwner) => {
    try {
        let obtained = petOwners[petOwner].amt;
        let obtainable = petOwners[petOwner].obtainable;
        let role = await petOwners[petOwner].role;
        const textSVG = `
<svg width="750" height="100"> 
  <text x="0" y="20" font-family="Arial" font-size="20" fill="#fefe00" text-anchor="start" dy=".3em">${petOwner}: ${obtained}/${obtainable}</text>
</svg>`;
        // Convert SVG text to PNG
        const textBuffer = await sharp(Buffer.from(textSVG))
            .toFormat('png')
            .toBuffer();
 
        // Read the image file
        const imageBuffer = await fs.promises.readFile(`${path.join(rolePath, formatRole(role))}`);
        const resizedRoleBuffer = await sharp(imageBuffer)
            .resize({ height: 25 }) // Adjust this value to match your text height
            .toBuffer();

        if (!textBuffer) {
            console.log('textBuffer is not created');
        }
        if (!resizedRoleBuffer) {
            console.log('imageBuffer is not created');
        }   
        const imageMetaData = await sharp(resizedRoleBuffer).metadata();
        const textMetaData = await sharp(textBuffer).metadata();
        //console.log(imageMetaData.width, textMetaData.width);

        //console.log(path.join(rolePath, formatRole(role)));
        
        // Create a blank canvas with the combined width of the two images
        const canvas = sharp({
            create: {
                width: textMetaData.width + imageMetaData.width,
                height: Math.max(textMetaData.height, imageMetaData.height),
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        });

        const compositeBuffer = await canvas
            .composite([
                { input: resizedRoleBuffer, left: 0, top: 5 },
                { input: textBuffer, left: imageMetaData.width, top: 0 }
                
            ])
            .toFormat('png')
            .toBuffer();

        return compositeBuffer;
        /*return sharp(Buffer.from(textSVG))
                    .toFormat('png')
                    .toBuffer();*/
    } catch (error) {
        console.error(error);
    }
}

const petCount = async (petOwner, petFile) => {
    try {
        let petCount = petOwners[petOwner].icons[petFile];

        const textSVG = `
<svg width="100" height="100"> 
  <text x="0" y="10" font-family="Arial" font-size="15" fill="#fefe00" text-anchor="start" dy=".3em">${petCount ? petCount : ''}</text>
</svg>`;
        return sharp(Buffer.from(textSVG))
            .toFormat('png')
            .toBuffer();
    } catch (error) {
        console.error(error);
    }
}




const canvasPets = async () => {
    try {
        await startIteratingPets();
        //const files = await fs.promises.readdir(directoryPathEnd);
        let petFiles = Object.entries(various.petFiles);
        for (const petO in petOwners) { //petO = name, for all names
            const compositeIcons = await Promise.all(petFiles.map(async (idFile, index) => {
                const petCountDisplay = await petCount(petO, idFile[1]);

                //console.log(petCountDisplay)
                return [{
                    input: path.join(transformedPath, idFile[1]),
                    left: (index % 10) * 75 + 5,
                    top: Math.floor(index / 10) * 50 + 40,
                    blend: petOwners[petO].icons[idFile[1]] ? 'over' : 'lighten' //if name has pet
                }, {
                    input: petCountDisplay,
                    left: (index % 10) * 75 + 15,
                    top: Math.floor(index / 10) * 50 + 40,
                }]
            }));
            let canvas = sharp(path.join(canvasPath, `petcanvas.png`));
            let obtained = await obtainedBuffer(petO);
            let flatCompositeIcons = compositeIcons.flat();
            let canvasBuffer = await canvas.composite(flatCompositeIcons).toBuffer();

            await sharp(canvasBuffer) //775 350
                .composite([{ input: obtained, top: 0, left: 5 }])
                .toFile(`${canvasPath}${petO}.png`);



            //console.log(path.join(transformedPath, petO));
            //petOwners[petO].icons.map((icon, index) => {
             //   console.log(icon, index, path.join(transformedPath, icon))});
            /*
                const compositeIcons = petOwners[petO].icons.map((icon, index) => (
                {
                    input: path.join(directoryPathEnd, icon),
                    left: (index % 10) * 75 + 5, // Position for each image horizontally
                    top: Math.floor(index / 10) * 50 + 40 // Position for each image vertically
                }));
            //console.log(JSON.stringify(compositeIcons, null, 2));
            let canvas = sharp(canvasPath)
            let obtained = await obtainedBuffer(petOwner);
            const buffer = await canvas.composite(compositeIcons).toBuffer();
            await sharp(buffer)
                .composite([{ input: obtained }])
                .toFile(`${canvasPath}${petOwner}.png`);
            */}
    } catch (error) {
        console.error(error)

    }
}

function imageExport() {
    canvasPets();
}
module.exports = imageExport;






const createTextSVG = async (directoryPath) => {
    try {
        // Helper function to capitalize words

        const files = await fs.promises.readdir(directoryPath);
        //return console.log(JSON.stringify(files, null, 2));
        for (const file of files) {
            const fileName = path.parse(file).name;
            const fileUp = capitalizeWords(fileName).trim();
            //console.log(fileUp)
            const textSVG = `
<svg width="75" height="50"> 
  <text x="50%" y="90%" font-family="Arial" font-size="10" fill="#ff981f" stroke="white" stroke-width="0px" text-anchor="middle" dy=".3em">${fileUp}</text>
</svg>`;
            const textBuffer = Buffer.from(textSVG);

            // Read the base image into a buffer
            const baseImageBuffer = await fs.promises.readFile(path.join(directoryPath, file));

            // Create a transparent canvas
            const transparentCanvas = sharp({
                create: {
                    width: 75,
                    height: 50,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            }).png();

            // Composite the base image onto the transparent canvas
            const withBaseImage = await transparentCanvas
                .composite([{ input: baseImageBuffer }])
                .toBuffer();

            // Composite the SVG buffer onto the canvas with the base image
            const finalImage = await sharp(withBaseImage)
                .composite([{ input: textBuffer, gravity: 'south' }])
                .png() // Ensure the output is in PNG format
                .toBuffer();

            // Write the final image to the file

            const outputPath = path.join(`${directoryPathEnd}`, `${fileUp}.png`);
            await fs.promises.writeFile(outputPath, finalImage);
            console.log(`Output image with text overlay saved as '${outputPath}'`);

        };
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

function initializePets() {
    //createTextSVG(directoryPath);
    canvasPets();
}
//initializePets();
