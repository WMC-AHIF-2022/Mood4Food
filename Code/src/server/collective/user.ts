export interface User {
    username: string,
    password: string,
    lastname: string,
    firstname: string,
    classMember: boolean,
    teacher?: number
}

// id INTEGER PRIMARY KEY,
//     username UNIQUE NOT NULL,
//     password NOT NULL,
//     lastname TEXT NOT NULL,
//     firstname TEXT NOT NULL,
//     className TEXT,
//     teacher INTEGER