/*********************************************************************************
*  WEB322 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Jagbir Singh Student ID: 144019221 Date: 05-02-2024
*
********************************************************************************/

require('dotenv').config();

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define(
    'Theme',
     { 
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: Sequelize.STRING,
    },
    {
        createdAt: false,
        updatedAt: false,
    }
);

const Set = sequelize.define(
    'Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
          resolve('operation was a success');
        }).catch(() => {
          reject("unable to sync the database");
        });
      });
}

getAllSets = () => {
    return Set.findAll({ include: [Theme] });
}

getSetByNum = (setNum) => {
    return Set.findAll({
        where: { set_num: setNum },
        include: [Theme],
    }).then((sets) => {
        if (sets.length > 0) {
            return sets[0];
        } else {
            throw new Error('Unable to find requested set');
        }
    }); 
}

getSetsByTheme = (theme) => {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`,
            },
        },
    }).then((sets) => {
        if (sets.length > 0) {
            return sets;
        } else {
            throw new Error('Unable to find requested sets');
        }
    }); 
}

addSet = (setData) => {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then((result) => resolve(result)) // Pass the result on success
      .catch((err) => {
        if (err.errors && err.errors.length > 0) {
          reject(err.errors[0].message);
        } else {
          reject("An unknown error occurred"); 
        }
      });
  });
};

  
getAllThemes = () => {
    return new Promise((resolve, reject) => {
        Theme.findAll()
            .then((themes) => resolve(themes))
            .catch((err) => reject(err));
    });
  };
  
editSet = (set_num, setData) => {
    return new Promise((resolve, reject) => {
      Set.update(setData, { where: { set_num } })
        .then((result) => {
          if (result[0] === 0) {
            reject({ message: "Can not find the set" });
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject({ message: err.errors[0].message });
        });
    });
  };
  
deleteSet = (set_num) => {
  return Set.destroy({ where: { set_num } })
      .catch((err) => {
        throw new Error(err.errors[0].message);
      });
};

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };