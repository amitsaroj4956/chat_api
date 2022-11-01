const express = require("express");
const router = express.Router();
const fs = require("fs");
const connection = require("./database");
var path = require("path");
const { application } = require("express");

require("dotenv").config();

const getAllConverstion = function (id, fn) {
    connection.getConnection((err, connection) => {
        let ConverstionList = [];
        let contactList = [];
        let sql = "SELECT * FROM `conversations`";
        connection?.query(sql, (err, rows) => {
            //  console.log(rows, "rowsrowsrows",err);
            if (!err) {
                if (rows.length != 0) {
                    ConverstionList = rows;
                }
            } else {
                return err;
            }
        });

        setTimeout(() => {
            const mergeResult = [
                ...ConverstionList,
                ...contactList,
            ];

            fn(mergeResult);
        }, 5000);
    });
};

module.exports = { getAllConverstion };
