const { error } = require('console');
const fs = require('fs');
const path = require('path');

// Specify the directory path
const directoryPath = 'VengIcons/Roles';


function deleteFiles() {
    // Read files from the directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(`Error reading the directory: ${err}`);
            return;
        }

        // Loop through the files
        files.forEach(file => {
            // Check if the file name contains a pattern like (1), (2), etc.
            if (/\(\d+\)/.test(file) || true) {
                const filePath = path.join(directoryPath, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${file}: ${err}`);
                    } else {
                        console.log(`Deleted duplicate file: ${file}`);
                    }
                });
            }
        });
    });
}


function removeExtraWording() { //adds .png
    // Read files from the directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(`Error reading the directory: ${err}`);
            return;
        }

        // Loop through the files
        files.forEach(file => {
            // Check if the file name contains a pattern like (1), (2), etc.
            if (/\(\d+\)/.test(file) || true) {
                const filePath = path.join(directoryPath, file);
                //const newFileName = file.replace(/\(\d+\)|\.webp$/i, '').trim();
                const newFileName = file.replace(/Clan_icon_-_/i, '').trim();
                const newFilePath = path.join(directoryPath, `${newFileName}`);
                fs.rename(filePath, newFilePath, (err) => {
                    if (err) {
                        console.error(`Error with file name: ${err}`);
                        return;
                    }
                    else {
                        console.log(`Renamed file: ${file} to ${newFileName}`);
                    }
                });
            }
        });
    });
}

function somefunction() {
    let images = ["Chaos Ele.png", "Supreme.png", "Graardor.png", "Baby Mole.png", "Prince Dragon.png", "Smoke Devil.png", "Kraken.png", "Snakeling.png", "Chompy.png", "Tzrek-Jad.png", "Hellpuppy.png", "Heron.png", "Rock Golem.png", "Beaver.png", "Rift Guardian.png", "Olmlet.png", "Skotos.png", "Vorki.png", "Lil' Zik.png", "Ikkle Hydra.png", "Sraracha.png", "Nexling.png"];

    let imageObject = {};

    images.forEach(image => {
        imageObject[image] = 1;
    });

    console.log(images.length);
}

somefunction()
//deleteFiles();
//removeExtraWording();

