export class TypeCheck {
    private handler;
    constructor(handler?: unknown) {
        this.handler == undefined
            ? (this.handler = console.log)
            : (this.handler = handler);
    }
    numSync(inp: number): number | null {
        if (typeof inp == "number") return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }
    boolSync(inp: boolean): boolean | null {
        if (typeof inp == "boolean") return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }
    funcSync(
        inp: void | ((...args: RestrictiveAny[]) => RestrictiveAny)
    ): RestrictiveAny {
        if (typeof inp == "function") return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }
    objeSync(inp: object): object | null {
        if (typeof inp == "object") return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }
    striSync(inp: string): string | null {
        if (typeof inp == "string") return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }

    TypeOfSync(type: string, inp: unknown): unknown {
        if (typeof inp == type) return inp;
        else {
            console.log(
                new Error(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                )
            );
            return null;
        }
    }

    // custom = {
    //     gender: async (input:boolean|null) => {
    //         return new Promise((resolve, reject) => {
    //             if (typeof input === "boolean" || input === null) {
    //                 // resolve(input)
    //                 if (input === true)     resolve({_: "woman", raw: true})
    //                 if (input === false)    resolve({_: "man", raw: false})
    //                 if (input === null)      resolve({_: "other", raw: null})
    //                 else                              reject(`<[ERROR]: Expected TypeOf input to be one of <boolean|null> but got ${typeof input}>`)
    //             }
    //             else reject(`<[ERROR]: Expected TypeOf input to be one of <boolean|null> but got ${typeof input}>`)
    //         })
    //     }
    // }
}

export class TypeCheckAsync extends TypeCheck {
    constructor(handler?: unknown) {
        super(handler);
    }
    async num(inp: number): Promise<number> {
        return new Promise((res, rej) => {
            if (typeof inp == "number") res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be 'number' but got ${typeof inp}>`
                );
        });
    }
    async bool(inp: boolean): Promise<boolean> {
        return new Promise((res, rej) => {
            if (typeof inp == "boolean") res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be 'boolean' but got ${typeof inp}>`
                );
        });
    }
    async func(
        inp: void | ((...args: RestrictiveAny[]) => RestrictiveAny)
    ): Promise<RestrictiveAny> {
        return new Promise((res, rej) => {
            if (typeof inp == "function") res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be 'function' but got ${typeof inp}>`
                );
        });
    }
    async obje(inp: object): Promise<object> {
        return new Promise((res, rej) => {
            if (typeof inp == "object") res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be 'object' but got ${typeof inp}>`
                );
        });
    }
    async stri(inp: string): Promise<string> {
        return new Promise((res, rej) => {
            if (typeof inp == "string") res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be 'string' but got ${typeof inp}>`
                );
        });
    }

    async TypeOf(type: string, inp: unknown): Promise<any> {
        return new Promise((res, rej) => {
            if (typeof inp == type) res(inp);
            else
                rej(
                    `<[ERROR]: Expected TypeOf input to be '${type}' but got ${typeof inp}>`
                );
        });
    }

    custom = {
        gender: async (input: boolean | null): Promise<object | string> => {
            return new Promise((resolve, reject) => {
                if (typeof input === "boolean" || input === null) {
                    // resolve(input)
                    if (input === true) resolve({ _: "woman", raw: true });
                    if (input === false) resolve({ _: "man", raw: false });
                    if (input === null) resolve({ _: "other", raw: null });
                    else
                        reject(
                            `<[ERROR]: Expected TypeOf input to be one of <boolean|null> but got ${typeof input}>`
                        );
                } else
                    reject(
                        `<[ERROR]: Expected TypeOf input to be one of <boolean|null> but got ${typeof input}>`
                    );
            });
        },
    };
}

export type RestrictiveAny_WithoutArray =
    | string
    | boolean
    | number
    | object
    | void
    | null;
export type RestrictiveAny_noPromise =
    | Array<RestrictiveAny_WithoutArray>
    | RestrictiveAny_WithoutArray;
export type RestrictiveAny =
    | Promise<RestrictiveAny_noPromise>
    | RestrictiveAny_noPromise;

export class Extra extends TypeCheckAsync {
    constructor(handler?: unknown) {
        super(handler);
    }
    async void(params: RestrictiveAny, silent?: boolean) {
        let res: RestrictiveAny[] = [];
        if (Array.isArray(params)) {
            params.forEach(async (task: RestrictiveAny, index: number) => {
                const resp: RestrictiveAny | never = eval(await exec(task));
                if (silent === false) console.info(index, "|", resp);
                return res.push(resp as unknown as never);
            });
            return res;
        } else {
            res = eval(await exec(params));
            if (silent === false) console.info("single", "|", res);
            return res;
        }

        async function exec(input: RestrictiveAny) {
            // console.log(`${input}`)
            // if (typeof input === "function" && `${input}`.startsWith("async")) return await input();
            if (typeof input === "function") return input();
            else if (typeof input === "string") return `'${input}'`;
            else return input;
        }
    }
}

const jsTypes = Extra;
export default jsTypes;
