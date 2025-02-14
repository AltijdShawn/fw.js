import { each } from "../Each";
import { Logger } from "../logger";
import { fMap } from "..";
import { common } from "../core/utils";
import { constants_1 } from "../core/types";

const userDb = fMap._map<string, User>()

const users: User[] = [
    {
        id: null,
        name: 'user1'
    },
    {
        id: null,
        name: 'user2'
    },
    {
        id: null,
        name: 'user3'
    },
    {
        id: null,
        name: 'user4'
    },
    {
        id: null,
        name: 'user5'
    },
    {
        id: null,
        name: 'user6'
    },
    {
        id: null,
        name: 'user7'
    },
    {
        id: null,
        name: 'user8'
    },
    {
        id: null,
        name: 'user9'
    },
    {
        id: null,
        name: 'user10'
    },
]

let users_withId: User[] = []

each(users, (user: User, next) => {
    user.id = common.mkRandStr3(16, constants_1.HEX_CHAR_LIST)
    users_withId.push(user)
    return next()
}, () => {
    each(users_withId, (user: User, next) => {
        userDb.set(user.id, user)
        return next()
    }, () => {
        console.log(JSON.stringify(userDb.all(), undefined, 4))
        console.log(JSON.stringify(userDb.manager.toTrueMap(), undefined, 4))
    })
})

interface User {
    id: null|string
    name: string
    [x:string|symbol]: any
}