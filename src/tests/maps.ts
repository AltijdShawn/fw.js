import * as fs from "node:fs";
import { pipeline } from "node:stream/promises";

import { each } from "../Each";
import { Logger } from "../logger";
import { fMap } from "..";
import { common } from "../core/utils";
import { constants_1 } from "../core/types";

import * as gzip from "node:zlib";

// const map1 = fMap.humanMap<string, number>();
// const map2 = fMap.trueMap<number, string>();

// map1.set("a", 1);
// map1.set("b", 2);
// map2.set(1, "a");
// map2.set(2, "b");

// console.log(`=== MAP TESTS ===`);
// // just now use all the operators of the map thing we made, just put a console.log and say the operation being used on which map and the arguments then put the output of said operation
// console.log("MAP1 GET 'a'", map1.get("a"));
// console.log("MAP1 GET 'b'", map1.get("b"));
// console.log("MAP2 GET 1", map2.get(1));
// console.log("MAP2 GET 2", map2.get(2));
// console.log("MAP1 DELETE 'a'", map1.del("a"));
// console.log("MAP1 GET 'a'", map1.get("a"));
// console.log("MAP1 GET 'b'", map1.get("b"));
// console.log("MAP2 DELETE 1", map2.del(1));
// console.log("MAP2 GET 1", map2.get(1));
// console.log("MAP2 GET 2", map2.get(2));
// console.log("MAP1 HAS 'a'", map1.has("a"));
// console.log("MAP1 HAS 'b'", map1.has("b"));
// console.log("MAP2 HAS 1", map2.has(1));
// console.log("MAP2 HAS 2", map2.has(2));

// console.log("MAP1 SET 'c', 3", map1.set("c", 3));
// console.log("MAP1 GET 'c'", map1.get("c"));
// console.log("MAP1 HAS 'c'", map1.has("c"));

// //Map2
// console.log("MAP2 SET 3, 'd'", map2.set(3, "d"));
// console.log("MAP2 GET 3", map2.get(3));
// console.log("MAP2 HAS 3", map2.has(3));

// //now do getAll on both
// console.log("MAP1 GET ALL", map1.getAll());
// console.log("MAP2 GET ALL", map2.getAll());

// const mmStore = fMap.trueMap<string | number, any>();
// const mmManager = fMap.humanMap<string | number, any>();
// // map3.manager.insert(map1.getAll())
// // map3.manager.insert(map2.getAll())

// mmStore.set("map1", map1.all());
// mmStore.set("map2", map2.all());
// console.log(mmStore.all());
// // console.log('MAP3 GET ALL', map3.getAll())

// mmManager.manager.replace(mmStore.get("map1"));
// mmManager.set("a", 1);
// mmStore.set("map1", mmManager.all());

// mmManager.manager.replace(mmStore.get("map2"));
// mmManager.set(1, "a");
// mmStore.set("map2", mmManager.all());

// mmManager.manager.clear();

// console.log(mmStore.all());
// mmStore.manager.clear();
// mmStore.set(0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// mmStore.set(1, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
// mmManager.set(-1, mmStore.all());
// // for (let i = 0; i < 10; i++) {
// //   mmManager.set(i, mmManager.all())
// //   mmManager.del(i-1)
// // }

// console.log(JSON.stringify(mmManager.all(), undefined, 4));

// //

// const cfg = {
//     sectors: {
//         amount: 8,
//         size: 4096,
//     },
//     partitions: {
//         amount: 4,
//     },
// };

const cfg = {
    sectors: {
        amount: 0,
        size: 0,
    },
    partitions: {
        amount: 0,
    },
};

const disk1 = fMap.humanMap<string, hotmi<string, string>[]>();
const disk2 = fMap.humanMap<string, hotmi<string, string>[]>();

const g = (length: number) =>
    common.mkRandStr2(length, constants_1.ALPHANUM_CHAR_LIST);

for (let l = 0; l <= cfg.partitions.amount; l++) {
    (async function () {
        const sectors1 = [];
        const sectors2 = [];
        for (let i = 0; i <= cfg.sectors.amount; i++) {
            sectors1.push(fMap.humanMap<number, string>());
            sectors2.push(fMap.humanMap<number, string>());
        }

        const part1 = fMap.humanMap<string, hotmi<number, string>[]>();
        const part2 = fMap.humanMap<string, hotmi<number, string>[]>();

        for (let i = 0; i <= cfg.sectors.amount; i++) {
            const tableId = 'Users'+i
            for (let j = 0; j <= cfg.sectors.size; j++) {
                console.log(l, i, j);
                // process.exit()
                (async function () {
                    const obj = {
                        token: g(8),
                        createdAt: Date.now(),
                        username: g(16),
                        password: g(64),
                        email: `${g(16)}@${g(4)}.${g(2)}`,
                        country: g(2),
                    }

                    sectors2[i]["set"](j, 
                        {
                            token: obj.token,
                            createdAt: new Date(obj.createdAt * 1000).toISOString(),
                            username: obj.username,
                            password: obj.password,
                            email: obj.email,
                            country: obj.username,
                        }
                    );

                    sectors1[i]["set"](
                        Number(j).toString(36), 
                        [
                            obj.token,
                            Number(obj.createdAt).toString(36),
                            obj.username,
                            obj.password,
                            obj.email,
                            obj.username,
                        ]);
                })();
            }
            (async function () {
                part1.set(tableId, sectors1[i]["manager"]["toTrueMap"]());
                part2.set(tableId, sectors2[i]["all"]());
            })();

            sectors1[i]["manager"]["clear"]();
            sectors2[i]["manager"]["clear"]();
            delete sectors1[i];
            delete sectors2[i];
        }

        (async function () {
            disk1.set('db'+l, <any> part1.manager.toTrueMap());
            disk2.set('db'+l, <any> part2.all());
        })();
        part1.manager.clear();
        part2.manager.clear();
    })();
}

[
    // "ascii",
    "utf8",
    // "utf-8",
    // "utf16le",
    // "utf-16le",
    // "ucs2",
    // "ucs-2",
    // "base64",
    // "base64url",
    // "latin1",
    // "binary",
    // "hex",
    "gzip", // My Own Thang
].forEach((format: BufferEncoding) => {
    if (<any> format === "gzip") {
        const str = JSON.stringify(disk1.manager.toTrueMap());

        fs.writeFileSync(
            `results/disk1/utf8.interm.json`,
            str,
            "utf8",
        );

        const gzip_ = gzip.createGzip();
        const source = fs.createReadStream(`results/disk1/utf8.interm.json`);
        const dest = fs.createWriteStream("results/disk1/utf8.json.gz");

        pipeline(source, gzip_, dest)
            .then((val) => {
                // fs.rmSync(`results/disk1/utf8.interm.json`);
                console.log({ val });
                continuing();
            })
            .catch((err) => {
                if (err) {
                    console.log(err);
                }
            });
    } else {
        const str = JSON.stringify(disk2.all());
        // console.log(format, str);
        fs.writeFileSync(
            `results/disk2/${format}.json`,
            str,
            format,
        );
    }
    // fs.writeFileSync(
    //     `results/disk2/${format}.json`,
    //     JSON.stringify(disk2.all()),
    //     format,
    // );
});

disk1.manager.clear();
disk2.manager.clear();

type hmi<k, v> = fMap.IMapItem<k, v>;
type tmi<k, v> = fMap.TTruemapItem<k, v>;

type hotmi<k, v> =
    | hmi<k, v>
    | tmi<k, v>;

// type BufferEncoding =
//     | "ascii"
//     | "utf8"
//     | "utf-8"
//     | "utf16le"
//     | "utf-16le"
//     | "ucs2"
//     | "ucs-2"
//     | "base64"
//     | "base64url"
//     | "latin1"
//     | "binary"
//     | "hex";

type User = {
    token: string;
    createdAt: string;
    username: string;
    password: string;
    email: string;
    country: string;
};

type UserRow = [
    token: string,
    createdAt: number,
    username: string,
    password: string,
    email: string,
    country: string,
];

function continuing() {
    const cluster1 = fMap.trueMap<
        number|string,
        fMap.TTruemapItem<
            number|string,
            fMap.TTruemapItem<
                number|string,
                fMap.TTruemapItem<
                    number|string,
                    UserRow
                >[]
            >[]
        >[]
    >();

    const db1 = fMap.trueMap<
        number|string,
        fMap.TTruemapItem<
            number|string,
            fMap.TTruemapItem<
                number|string,
                UserRow
            >
        >[]
    >();

    // const disk_file = fs.readFileSync('results/disk1/base64.json', 'base64')
    const disk_file = fs.readFileSync("results/disk1/utf8.json.gz");
    gzip.unzip(disk_file, (err, buffer) => {
        if (err) {
            console.error("An error occurred:", err);
            process.exitCode = 1;
        }
        cluster1.manager.replace(JSON.parse(buffer.toString()));
        db1.manager.replace(<any> cluster1.get('db0'));
        const tables = {
            UsersEU: db1.get('Users0'),
            UsersUSA: db1.get('Users1'),
        };

        const FindUser = function (id: string, table) {
            return (() => {
                let users = fMap.trueMap<number|string, User>();
                for (const user of <any[]> table) {
                    users.set(user[0], {
                        token: user[1][0],
                        createdAt: new Date(
                            parseInt(
                                user[1][1], 
                                36
                            ) * 1000
                        ).toISOString(),
                        username: user[1][2],
                        password: user[1][3],
                        email: user[1][4],
                        country: user[1][5],
                    });
                }
                return users;
            })().get(id);
        };

        console.log(FindUser('0', tables.UsersEU));
    });
}
