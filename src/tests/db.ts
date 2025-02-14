import * as fs from "node:fs";
import { pipeline } from "node:stream/promises";

import { each } from "../Each";
import { Logger } from "../logger";
import { fMap, DB } from "..";
import { common } from "../core/utils";
import { constants_1 } from "../core/types";

import {SQLInterface} from '../db/sqlInterface';
import {QueryInterface} from "../db/query";


import * as gzip from "node:zlib";

// const db = new DB.db();

// db.set('a.b.c.d.e.f.g.h.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z', 0);

// console.log(
// db.get('a.b.c.d.e.f.g.h.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z'),
// db.data.all()
// );

// fs.writeFileSync('results/db.test.json', JSON.stringify(db.data.all()), 'utf8');

// SQL Interface Test
(async function() {

    const users = [
        {
            name: 'Amy',
            age: 18
        },
        {
            name: 'Lily',
            age: 19
        }
    ]

    let results

    const sql = new SQLInterface();

    // Create users table (The normal way)
    await sql.executeQuery("CREATE TABLE users (name text, age number)");

    // create users table (The insertion way)
    // await sql.executeQuery("INSERT INTO users2._schema (name, age) VALUES ('string', 'number')");


    // for (const user of users) {
    //     await sql.executeQuery(`INSERT INTO users (name, age) VALUES ('${user.name}', ${user.age})`)
    // }
    fs.writeFileSync('results/db.sql.test.json', JSON.stringify(sql.db.data.all()), 'utf8');
    // Insert a record
    await sql.executeQuery("INSERT INTO users (name, age) VALUES ('John', 25)").then(async () => {

        fs.writeFileSync('results/db.sql.test.json', JSON.stringify(sql.db.data.all()), 'utf8');

        // Select records
        results = await sql.executeQuery("SELECT name, age FROM users WHERE age > 20");

        console.log('Add user:', results)
    });
    // Update records
    await sql.executeQuery("UPDATE users SET age = 26 WHERE name = 'John'").then(async () => {
        
        fs.writeFileSync('results/db.sql.test.json', JSON.stringify(sql.db.data.all()), 'utf8');
        
        // Select records
        results = await sql.executeQuery("SELECT name, age FROM users WHERE age > 20");
        
        console.log('Update user:', results)
    });
    // Delete records
    // await sql.executeQuery("DELETE FROM users WHERE name = 'John'").then(async () => {
        
    //     fs.writeFileSync('results/db.sql.test.json', JSON.stringify(sql.db.data.all()), 'utf8');
        
    //     // Select records
    //     results = await sql.executeQuery("SELECT name, age FROM users WHERE age > 20");
        
    //     console.log('Delete user:', results)
    // });
})();//();

// Query Test
(async function() {

    const users = [
        {
            name: 'Amy',
            age: 69
        },
        {
            name: 'Lily',
            age: 19
        },
        {
            name: 'John',
            age: 25
        },
        {
            name: 'Jane',
            age: 21
        }
    ]

    let results

    const q = new QueryInterface

    // Create users table
    await q.execute({
        op: 'create',
        what: 'table',
        id: 'users',
        columns: [
            {name: 'name', type: 'string'},
            {name: 'age', type: 'number'},
        ]
    })

    fs.writeFileSync('results/db.q.test.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');

    // Test Table Creation using insertion
    await q.execute({
        op: 'insert',
        what: 'into',
        id: 'users2._schema',
        columns: ['name', 'age'],
        values: ['string', 'number']
    });

    fs.writeFileSync('results/db.q.test.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');

    // Insert the users
    for (const user of users) {
        await q.execute({
            op: 'insert',
            what: 'into',
            id: 'users',
            columns: ['name', 'age'],
            values: ["'"+user.name+"'", user.age]
        })
    }

    // console.log(JSON.stringify(q.db.data.all(), undefined, 2))

    fs.writeFileSync('results/db.q.test.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');

    await q.execute({
        op: 'update',
        id: 'users',
        columns: [{
            columnName: 'age',
            newValue: 18
        },
        {
            columnName: 'name',
            newValue: "'Amber'"
        }],
        where: [
            'age > 20',
            'name = \'Amy\''
        ]
    })

    fs.writeFileSync('results/db.q.test.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');


    await q.execute({
        op: 'select',
        id: 'users',
        columns: ['name', 'age'],
        where: 'age < 20'
    }).then((res) => {
        console.log('Select(age < 20):', res)
    })

    await q.execute({
        op: 'select',
        id: 'users',
        columns: ['name', 'age'],
        where: 'age < 19'
    }).then((res) => {
        console.log('Select(age < 19):', res)
    })

    await q.execute({
        op: 'delete',
        id: 'users',
        where: 'name = \'John\''
    }).then((res) => {
        console.log('Delete(name = \'John\'):', res)
    })

    // Delete records
    // await sql.executeQuery("DELETE FROM users WHERE name = 'John'").then(async () => {
        
    //     fs.writeFileSync('results/db.sql.test.json', JSON.stringify(sql.db.data.all()), 'utf8');
        
    //     // Select records
    //     results = await sql.executeQuery("SELECT name, age FROM users WHERE age > 20");
        
    //     console.log('Delete user:', results)
    // });
});

(async function() {

    const users = [
        {
            name: 'Amy',
            age: 69
        },
        {
            name: 'Lily',
            age: 19
        },
        {
            name: 'John',
            age: 25
        },
        {
            name: 'Jane',
            age: 21
        }
    ]

    let results

    const q = new QueryInterface

    // Create users table
    await q.execute({
        op: 'create',
        what: 'table',
        id: 'users',
        columns: [
            {name: 'name', type: 'string'},
            {name: 'age', type: 'number'},
        ]
    })
    await q.execute({
        op: 'create',
        what: 'table',
        id: 'posts',
        columns: [
            {name: 'username', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'content', type: 'string'},
        ]
    })

    fs.writeFileSync('results/db.q.test.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');


    // Insert the users
    for (const user of users) {
        await q.execute({
            op: 'insert',
            what: 'into',
            id: 'users',
            columns: ['name', 'age'],
            values: ["'"+user.name+"'", user.age]
        })

        await q.execute({
            op: 'insert',
            what: 'into',
            id: 'posts',
            columns: ['username', 'title', 'content'],
            values: ["'"+user.name+"'", String(user.age), `'${user.name}.${user.age}'`]
        })
    }

    // console.log(JSON.stringify(q.db.data.all(), undefined, 2))

    fs.writeFileSync('results/db.conversion.json', JSON.stringify(q.db.data.all(), undefined, 2), 'utf8');

    // const db_ = q.db.data.all();
    // const db2 = fMap.trueMap()
    // for (let table of db_) {
    //     console.log('Now working in table:',table[0])
        
    //     const _schema = table[1][0][1];
    //     const schema = {
    //         columns: _schema[0][1],
    //         createdAt: _schema[1][1]
    //     }
    //     console.log('Schema:', schema)
    //     for (let record of table[1][1][1]) {
    //         const key = record[0];

    //         const _val = record[1];

    //         // get all the values inside the _val object and put them in an array in order
    //         const values = [];
    //         Object.values(_val).forEach((val) => {
    //             values.push(val);
    //         })

            
    //         // console.log('Record:', record, key, values)

    //     }
    // }
})();

// // Create users table (The normal way)
// await q.execute({
//     op: 'create',
//     what: 'table',
//     id: 'users',
//     columns: [
//         {name: 'name', type: 'string'},
//         {name: 'age', type: 'number'},
//     ]
// })
// // Create users table (The insertion way)
// await q.execute({
//     op: 'insert',
//     what: 'into',
//     id: 'users._schema',
//     columns: ['name', 'age'],
//     values: ['string', 'number']
// });