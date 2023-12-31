const tableNameMappings = {
    student: "Student",
    hobby: "Hobby",
    course: "Course",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
    interests: "Interests",
    memberships: "Memberships",
    room: "Room",
    clubhobby: "ClubHobby",
    clubemails: "ClubEmails",
    club: "Club"
};

const primaryKeyMappings = {
    Student: ["URN"],
    Hobby: ["HobbyID"],
    Course: ["CrsCode"],
    Undergraduate: ["UGURN"],
    Postgraduate: ["PGURN"],
    Interests: ["URN", "HobbyID"],
    Memberships: ["ClubID", "URN"],
    Room: ["RoomID"],
    ClubHobby: ["ClubID", "HobbyID"],
    ClubEmails: ["ClubID", "ClubEmail"],
    Club: ["ClubID"]
};

const foreignKeyMappings = {
    Student: [["Course:CrsCode", "StuCourse"]],
    Hobby: null,
    Course: null,
    Undergraduate: [["Student:URN", "UGURN"]],
    Postgraduate: [["Student:URN", "PGURN"]],
    Interests: [["Student:URN", "URN"], ["Hobby:HobbyID", "HobbyID"]],
    Memberships: [["Club:ClubID", "ClubID"], ["Student:URN", "URN"]],
    Room: [["Club:ClubID", "ClubID"]],
    ClubHobby: [["Club:ClubID", "ClubID"], ["Hobby:HobbyID", "HobbyID"]],
    ClubEmails: [["Club:ClubID", "ClubID"]],
    Club: [["Student:URN", "ClubPresIDent"]]
};

async function autocomplete(tableName, connection) {
    let autocomplete = {};

    let [rows, fields] = await (await connection).execute(`SELECT * FROM ${tableName};`).catch((err) => {
        console.error(err);
    });

    let keys = fields.map((field) => field.name);
    let foreignKeys = foreignKeyMappings[tableName];

    for (let i = 0; i < keys.length; i++) {
        if (foreignKeys == null) continue;
        for (let j = 0; j < foreignKeys.length; j++) {
            if (keys[i] !== foreignKeys[j][1]) continue;

            let foreignTable = foreignKeys[j][0].split(":")[0];
            let foreignColumn = foreignKeys[j][0].split(":")[1];

            let primaryColumn = foreignKeys[j][1];
            let temp = [];
            let [rows, fields] = await (await connection).execute(`SELECT ${foreignColumn} FROM ${foreignTable};`).catch((err) => {
                console.error(err);
            });

            for (let k = 0; k < rows.length; k++) {
                temp.push(rows[k][foreignColumn]);
            }

            autocomplete[primaryColumn] = temp;
        }
    }
    return autocomplete;
}

async function createMetadata(tableName, data, connection) {
    let metadata = {};

    let [rows, fields] = await (await connection).execute(`SELECT * FROM ${tableName};`).catch((err) => {
        console.error(err);
    });


    let keys = fields.map((field) => field.name);
    let primaryKeys = primaryKeyMappings[tableName];

    let autocompleteData = await autocomplete(tableName, connection);

    for (let i = 0; i < keys.length; i++) {
        let tempObj = {primary: false, data: undefined, autocomplete: undefined};
        if (primaryKeys.includes(keys[i])) {
            tempObj.primary = true;
        }
        if (autocompleteData[keys[i]] !== null) {
            tempObj.autocomplete = autocompleteData[keys[i]];
        }
        if (data !== null && data[keys[i]] !== undefined) {
            tempObj.data = data[keys[i]];
        }

        metadata[keys[i]] = tempObj;
    }

    return metadata;
}

function viewMetadata(rows, tableName) {
    let metadata = {};
    let foreignKeyMetadata = {};
    let primaryKeyMetadata = {};

    if (rows.length === 0) return;
    let keys = Object.keys(rows[0]);
    let foreignKeys = foreignKeyMappings[tableName];
    let primaryKeys = primaryKeyMappings[tableName];

    for (let i = 0; i < keys.length; i++) {
        for (let k = 0; k < primaryKeys.length; k++) {
            if (keys[i] !== primaryKeys[k]) continue;
            primaryKeyMetadata[i] = `/view/${tableName}/`
        }

        if (foreignKeys == null) continue;
        for (let j = 0; j < foreignKeys.length; j++) {
            if (keys[i] !== foreignKeys[j][1]) continue;
            foreignKeyMetadata[i] = `/view/${foreignKeys[j][0].split(":")[0]}/`
        }
    }

    metadata["foreignKey"] = foreignKeyMetadata;
    metadata["primaryKey"] = primaryKeyMetadata;

    return metadata;
}

module.exports = {tableNameMappings, primaryKeyMappings, viewMetadata, createMetadata}