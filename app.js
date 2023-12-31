const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const syncMysql = require('mysql2');
const {uuid} = require('uuidv4');
const {tableNameMappings, primaryKeyMappings, createMetadata, viewMetadata} = require("./utils");
const queries = require("./queries");

const password = "CamCam1234";
const connection = mysql.createConnection({
    host: '129.151.69.174',
    port: '3308',
    user: 'root',
    password: password,
    database: 'coursework'
}).catch((err) => {
    console.error(err);
});

const app = express();
let PORT = 3000;

// add all the uuid and the fetched data for updates in an array
let updateQueue = [];
//clean the queue every 5 seconds with all done updates
setInterval(() => {
    for (let i = 0; i < updateQueue.length; i++) {
        if (updateQueue[i].done) {
            updateQueue.splice(i, 1);
        }
    }
}, 5000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware to check if the table exists and set table name
const tableMiddleware = (req, res, next) => {
    if (!tableNameMappings.hasOwnProperty(req.params.tableId.toLowerCase())) {
        res.status(404).render("error", {message: "Table not found"});
    } else {
        req.tableName = tableNameMappings[req.params.tableId.toLowerCase()];
        next();
    }
}

const idMiddleware = (req, res, next) => {
    if (isNaN(req.params.id)) {
        // if the id is not a number, then it's a string
        req.params.id = `'${req.params.id}'`;
    }
    next();
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', async (req, res) => {
    let records = 0;
    // get all the tables and count the records
    let [rows, fields] = await (await connection).execute("SHOW TABLES").catch((err) => {
        console.error(err);
        res.status(500).render("error", {message: "Something went wrong"});
    });

    // count the records in each table and add them to the total
    for (const row of rows) {
        let [tempRows, tempFields] = await (await connection).execute(`SELECT COUNT(*) FROM ${row.Tables_in_coursework};`).catch((err) => {
            console.error(err);
            res.status(500).render("error", {message: "Something went wrong"});
        });
        records += tempRows[0]["COUNT(*)"];
    }

    res.render("index", {numTables: rows.length, numRecords: records});
});

app.get('/reset', (req, res) => {
    const syncConnection = (() => {
        try {
            return syncMysql.createConnection({
                host: '129.151.69.174',
                port: '3308',
                user: 'root',
                password: password,
            })
        } catch (err) {
            console.error(err);
            res.status(500).render("error", {message: "Something went wrong"});
        }
    })();

    for (let i = 0; i < queries.length; i++) {
        syncConnection.query(queries[i], (err) => {
            if (err) {
                console.error(err);
                res.status(500).render("error", {message: "Something went wrong"});
            }
        });
    }
    syncConnection.end();
    res.render("reset");
});

app.get('/create', (req, res) => {
    res.render("action_home", {operation: "Create", tables: Object.values(tableNameMappings)});
});

app.get('/create/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;

    res.render("create", {
        name: tableName,
        metadata: await createMetadata(tableName, null, connection)
    });
});

app.get('/view', (req, res) => {
    res.render("action_home", {operation: "View", tables: Object.values(tableNameMappings)});
});

app.get('/view/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let [rows, fields] = await (await connection).execute(`SELECT * FROM ${tableName};`).catch((err) => {
        console.error(err);
        res.status(500).render("error", {message: "Something went wrong"});
    });

    if (rows.length === 0) {
        res.status(404).render("error", {message: "No records found"});
        return;
    }

    res.render("view", {
        rows: rows,
        fields: fields,
        name: tableName,
        metadata: viewMetadata(rows, tableName),
    });
});

app.get('/view/:tableId/:id', tableMiddleware, idMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let keys = primaryKeyMappings[tableName];
    let rows = [];
    let fields = [];

    // do an or condition by search for the id in all the possible primary keys and grouping them together
    for (let i = 0; i < keys.length; i++) {
        [tempRows, fields] = await (await connection).execute(`SELECT * FROM ${tableName} WHERE ${keys[i]} = ${req.params.id};`).catch((err) => {
            console.error(err);
            res.status(500).render("error", {message: "Something went wrong"});
        });
        rows.push(...tempRows);
    }

    if (rows.length === 0) {
        res.status(404).render("error", {message: "No records found"});
        return;
    }

    res.render("view", {
        rows: rows,
        fields: fields,
        name: tableName,
        metadata: viewMetadata(rows, tableName),
    });
});

app.get('/update', (req, res) => {
    res.render("action_home", {operation: "Update", tables: Object.values(tableNameMappings)});
});

app.get('/update/:tableId/:uuid', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let storedMetadata = updateQueue.find((obj) => obj.uuid === req.params.uuid);

    if (storedMetadata === undefined) {
        res.redirect(`/view/${tableName}/${req.params.uuid}?message=Choose a Record to Edit`);
        return;
    }

    res.render("update_uuid", {
        name: tableName,
        metadata: await createMetadata(tableName, storedMetadata.rows[0], connection)
    });
});

app.get('/delete', (req, res) => {
    res.render("action_home", {operation: "Delete", tables: Object.values(tableNameMappings)});
});

app.get('/delete/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let [rows, fields] = await (await connection).execute(`SELECT * FROM ${tableName};`).catch((err) => {
        console.error(err);
        res.status(500).render("error", {message: "Something went wrong"});
    });

    if (rows.length === 0) {
        res.status(404).render("error", {message: "No records found"});
        return;
    }

    res.render("delete", {
        rows: rows,
        fields: fields,
        name: tableName,
        metadata: viewMetadata(rows, tableName)
    });
});


app.post('/create/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;

    // insert the record into the table with the values from the request body
    await (await connection).execute(`INSERT INTO ${tableName} (${Object.keys(req.body).join(", ")}) VALUES ('${Object.values(req.body).join("', '")}')`).catch((err) => {
        console.error(err);
        res.status(500).send("Something went wrong")
    });

    res.send({status: "OK"});
});

app.post('/update/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let primaryKeys = primaryKeyMappings[tableName];

    // create partial queries for each primary key
    let querySublets = [];
    for (let i = 0; i < primaryKeys.length; i++) {
        querySublets.push(`${primaryKeys[i]} = ${req.body[i]}`);
    }
    // generate an uuid for the update
    let uniqueID = uuid();
    // fetch the record to update
    let [rows, fields] = await (await connection).execute(`SELECT * FROM ${tableName} WHERE ${querySublets.join(" AND ")};`).catch((err) => {
        console.error(err);
        res.status(500).render("error", {message: "Something went wrong"});
    });

    // add the uuid and the fetched data to the update queue
    updateQueue.push({
        uuid: uniqueID,
        rows: rows,
        done: false
    });

    // send the uuid back to the client
    res.send({status: "OK", uuid: uniqueID});
});

app.post('/update/:tableId/:uuid', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    // fetch the record to update from the update queue
    let storedMetadata = updateQueue.find((obj) => obj.uuid === req.params.uuid);
    let storedMetadataIdx = updateQueue.findIndex((obj) => obj.uuid === req.params.uuid);

    let primaryKeys = primaryKeyMappings[tableName];
    let querySublets = [];
    let updateSublets = [];

    // create partial queries for each primary key (conditions)
    for (let i = 0; i < primaryKeys.length; i++) {
        querySublets.push(`${primaryKeys[i]} = ${storedMetadata.rows[0][primaryKeys[i]]}`);
    }

    // create partial queries for each column (update)
    Object.keys(storedMetadata.rows[0]).forEach((key) => {
        updateSublets.push(`${key} = '${req.body[key]}'`);
    });

    // join the queries and update the record
    await (await connection).execute(`UPDATE ${tableName} SET ${updateSublets.join(", ")} WHERE ${querySublets.join(" AND ")};`).catch((err) => {
        console.error(err);
        res.status(500).send("Something went wrong")
    });

    // mark the update as done
    updateQueue[storedMetadataIdx].done = true;

    res.send({status: "OK"});
});

app.post('/delete/:tableId', tableMiddleware, async (req, res) => {
    let tableName = req.tableName;
    let primaryKeys = primaryKeyMappings[tableName];

    // create partial queries for each primary key
    let querySublets = [];
    for (let i = 0; i < primaryKeys.length; i++) {
        querySublets.push(`${primaryKeys[i]} = ${req.body[i]}`);
    }

    // do an and condition for all the subqueries to delete the record
    await (await connection).execute(`DELETE FROM ${tableName} WHERE ${querySublets.join(" AND ")};`).catch((err) => {
        console.error(err);
        res.status(500).render("error", {message: "Something went wrong"});
    });
    res.send({status: "OK"})
});

app.listen(PORT, () => {
    console.log(`Express app listening on port ${PORT}`)
});
