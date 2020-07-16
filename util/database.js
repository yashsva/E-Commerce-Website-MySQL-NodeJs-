const Sequelize=require('sequelize');

const sequelize=new Sequelize('node-complete','root','sunil@mysql',{
    dialect:'mysql',
    host:'localhost'
});

module.exports=sequelize;