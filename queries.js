const queries = [
    `DROP DATABASE IF EXISTS coursework;`,
    `CREATE DATABASE coursework;`,
    `USE coursework;`,
    `DROP TABLE IF EXISTS Course;`,
    `CREATE TABLE Course (
        CrsCode 	INT UNSIGNED NOT NULL,
        CrsTitle 	VARCHAR(255) NOT NULL,
        CrsEnrollment INT UNSIGNED,
        PRIMARY KEY (CrsCode)
    );`,
    `INSERT INTO Course VALUES
        (100,'BSc Computer Science', 150),
        (101,'BSc Computer Information Technology', 20),
        (200, 'MSc Data Science', 100),
        (201, 'MSc Security', 30),
        (210, 'MSc Electrical Engineering', 70),
        (211, 'BSc Physics', 100);`,
    `DROP TABLE IF EXISTS Student;`,
    `CREATE TABLE Student (
        URN         INT UNSIGNED NOT NULL,
        StuFName 	VARCHAR(255) NOT NULL,
        StuLName 	VARCHAR(255) NOT NULL,
        StuDOB 	    DATE,
        StuPhone 	VARCHAR(12),
        StuCourse	INT UNSIGNED NOT NULL,
        StuType 	ENUM('UG', 'PG'),
        PRIMARY KEY (URN),
        FOREIGN KEY (StuCourse) REFERENCES Course (CrsCode)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Student VALUES
        (612345, 'Sara', 'Khan', '2002-06-20', '01483112233', 100, 'UG'),
        (612346, 'Pierre', 'Gervais', '2002-03-12', '01483223344', 100, 'UG'),
        (612347, 'Patrick', 'O-Hara', '2001-05-03', '01483334455', 100, 'UG'),
        (612348, 'Iyabo', 'Ogunsola', '2002-04-21', '01483445566', 100, 'UG'),
        (612349, 'Omar', 'Sharif', '2001-12-29', '01483778899', 100, 'UG'),
        (612350, 'Yunli', 'Guo', '2002-06-07', '01483123456', 100, 'UG'),
        (612351, 'Costas', 'Spiliotis', '2002-07-02', '01483234567', 100, 'UG'),
        (612352, 'Tom', 'Jones', '2001-10-24',  '01483456789', 101, 'UG'),
        (612353, 'Simon', 'Larson', '2002-08-23', '01483998877', 101, 'UG'),
        (612354, 'Sue', 'Smith', '2002-05-16', '01483776655', 101, 'UG');`,
    `DROP TABLE IF EXISTS Undergraduate;`,
    `CREATE TABLE Undergraduate (
        UGURN 	INT UNSIGNED NOT NULL,
        UGCredits   INT NOT NULL,
        CHECK (60 <= UGCredits <= 150),
        PRIMARY KEY (UGURN),
        FOREIGN KEY (UGURN) REFERENCES Student(URN)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Undergraduate VALUES
        (612345, 120),
        (612346, 90),
        (612347, 150),
        (612348, 120),
        (612349, 120),
        (612350, 60),
        (612351, 60),
        (612352, 90),
        (612353, 120),
        (612354, 90);`,
    `DROP TABLE IF EXISTS Postgraduate;`,
    `CREATE TABLE Postgraduate (
        PGURN 	INT UNSIGNED NOT NULL,
        Thesis  VARCHAR(512) NOT NULL,
        PRIMARY KEY (PGURN),
        FOREIGN KEY (PGURN) REFERENCES Student(URN)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Student VALUES
        (615706, 'Twila', 'Cormier', '2001-01-29', '01483103995', 200, 'PG'),
        (619834, 'Melody', 'Steuber', '2004-06-19', '01483723791', 200, 'PG'),
        (612456, 'Ashlee', 'Kuhlman', '1999-06-30', '01483555997', 201, 'PG'),
        (612093, 'Glenda', 'Cummings', '2003-02-28', '01483277381', 201, 'PG'),
        (615842, 'Deshawn', 'Douglas', '2004-10-25', '01483877760', 200, 'PG');`,
    `INSERT INTO Postgraduate VALUES
        (615706, 'Ethical alternatives to animal testing.'),
        (619834, 'What’s the future of the Dead Sea?'),
        (612456, 'Does accent affect singing ability?'),
        (612093, 'The importance of corporate values.'),
        (615842, 'Can we regulate influencer marketing?');`,
    `DROP TABLE IF EXISTS Club;`,
    `CREATE TABLE Club (
        ClubID        INT UNSIGNED NOT NULL UNIQUE,
        ClubName      VARCHAR(512) NOT NULL,
        ClubPresident INT UNSIGNED NOT NULL,
        PRIMARY KEY (ClubID),
        FOREIGN KEY (ClubPresident) REFERENCES Student(URN)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Club VALUES
        (47843, 'Hiking Club', 612351),
        (43256, 'Chess Soc', 615706),
        (41438, 'Climbing Club', 612093),
        (45349, 'Reading Club', 612354),
        (46136, 'Dancing Soc', 615842);`,
    `DROP TABLE IF EXISTS Memberships;`,
    `CREATE TABLE Memberships(
        ClubID INT UNSIGNED NOT NULL,
        URN INT UNSIGNED NOT NULL,
        PRIMARY KEY(ClubID, URN),
        FOREIGN KEY (ClubID) REFERENCES Club(ClubID)
        ON DELETE CASCADE,
        FOREIGN KEY (URN) REFERENCES Student(URN)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Memberships VALUES
        (47843, 612350),
        (46136, 612352),
        (41438, 612345),
        (45349, 619834),
        (46136, 612350);`,
    `DROP TABLE IF EXISTS ClubEmails;`,
    `CREATE TABLE ClubEmails(
        ClubID    INT UNSIGNED NOT NULL,
        ClubEmail VARCHAR(512) NOT NULL UNIQUE,
        PRIMARY KEY (ClubID, ClubEmail),
        FOREIGN KEY (ClubID) REFERENCES Club(ClubID)
        ON DELETE CASCADE
    );`,
    `INSERT INTO ClubEmails VALUES
        (47843, 'hiking@surrey.ac.uk'),
        (46136, 'dancing@surrey.ac.uk'),
        (41438, 'climbing@surrey.ac.uk'),
        (45349, 'reading@surrey.ac.uk'),
        (46136, 'dancing-membership@surrey.ac.uk');`,
    `DROP TABLE IF EXISTS Hobby;`,
    `CREATE TABLE Hobby (
        HobbyID   INT UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT,
        HobbyName VARCHAR(512) NOT NULL UNIQUE,
        PRIMARY KEY (HobbyID)
    );`,
    `INSERT INTO Hobby (HobbyName) VALUES
        ('reading'),
        ('hiking'),
        ('chess'),
        ('taichi'),
        ('ballroom dancing'),
        ('football'),
        ('tennis'),
        ('rugby'),
        ('climbing'),
        ('rowing');`,
    `DROP TABLE IF EXISTS ClubHobby;`,
    `CREATE TABLE ClubHobby(
        ClubID INT UNSIGNED NOT NULL,
        HobbyID INT UNSIGNED NOT NULL,
        PRIMARY KEY(ClubID, HobbyID),
        FOREIGN KEY (ClubID) REFERENCES Club(ClubID)
        ON DELETE CASCADE,
        FOREIGN KEY (HobbyID) REFERENCES Hobby(HobbyID)
        ON DELETE CASCADE
    );`,
    `INSERT INTO ClubHobby VALUES
        (47843, 2),
        (46136, 5),
        (41438, 9),
        (45349, 1),
        (43256, 3);`,
    `DROP TABLE IF EXISTS Interests;`,
    `CREATE TABLE Interests(
        URN INT UNSIGNED NOT NULL,
        HobbyID INT UNSIGNED NOT NULL,
        PRIMARY KEY(URN, HobbyID),
        FOREIGN KEY (URN) REFERENCES Student(URN)
        ON DELETE CASCADE,
        FOREIGN KEY (HobbyID) REFERENCES Hobby(HobbyID)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Interests VALUES
        (612345, 1),
        (612346, 4),
        (612347, 7),
        (612348, 5),
        (612349, 8);`,
    `DROP TABLE IF EXISTS Room;`,
    `CREATE TABLE Room (
        RoomID   INT UNSIGNED NOT NULL UNIQUE,
        Capacity INT UNSIGNED NOT NULL,
        ClubID   INT UNSIGNED,
        PRIMARY KEY (RoomID),
        FOREIGN KEY (ClubID) REFERENCES Club(ClubID)
        ON DELETE CASCADE
    );`,
    `INSERT INTO Room VALUES
        (1765, 20, 46136),
        (1873, 30, 47843),
        (1967, 35, 41438),
        (1432, 50, 45349),
        (1732, 60, 43256);`
];

module.exports = queries;