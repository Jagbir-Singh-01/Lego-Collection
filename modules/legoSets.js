/*********************************************************************************
*  WEB322 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Jagbir Singh Student ID: 144019221 Date: 05-02-2024
*
********************************************************************************/

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");

let sets = [];
let i = 0;

initialize = () => {
    return new Promise((resolve, reject) => {
        setData.forEach(element => {
            sets[i] = element;
            let themeObject = themeData.find(({id}) => id === sets[i].theme_id);
            if (themeObject) {
                sets[i]["theme"] = themeObject.name;
            }
            i = i + 1;
        });
        if (sets) {
            resolve(sets)
        }
    })
}

getAllSets = () => {
    return new Promise((resolve, reject) => {
        if (sets) {
            resolve(sets)
        }
    })
}

getSetByNum = (setNum) => {
    return new Promise((resolve, reject) => {
        let set = sets.find(({set_num}) => set_num === setNum);
        if (set) {
            resolve(set);
        }
        else {
            reject(" unable to find requested set");
        }
    })
}

getSetsByTheme = (theme) => {
    return new Promise((resolve, reject) => {
        let set = sets.filter((element) => {
            return element.theme && element.theme.toLowerCase().includes(theme.toLowerCase());
        });
        if (set) {
            resolve(set)
        }
        else {
            reject("unable to find requested sets");
        }
    })
}

initialize();

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };