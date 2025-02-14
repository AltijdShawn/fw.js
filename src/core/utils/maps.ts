export type IMapItem<K, V> = {
    key: K;
    value: V;
}

export function _map<K, V>() {
    let map_store: IMapItem<K, V>[] = [];

    function entries(): [K, V][] {
        return map_store.map(item => [item.key, item.value]);
    }

    function keys(): K[] {
        return map_store.map(item => item.key);
    }

    function values(): V[] {
        return map_store.map(item => item.value);
    }

    function length(): number {
        return map_store.length;
    }

    function set(key: K, value: V) {
        if (has(key)) del(key);
        return map_store.push({
            key,
            value,
        });
    }

    function get(key: K): V | Error {
        const item = map_store.find((item) => item.key === key);
        if (item) {
            return item.value;
        } else {
            return new Error("Key not found");
        }
    }

    function getAll(): IMapItem<K, V>[] {
        return map_store;
    }

    function has(key: K): boolean {
        return map_store.some((item) => item.key === key);
    }

    function del(key: K): IMapItem<K, V>[] {
        return map_store = map_store.filter((item) => item.key !== key);
    }

    function clear(): never[] {
        return map_store = [];
    }
    function insert(map: IMapItem<K, V>[]) {
        return map_store = [...map_store, ...map];
    }
    function replace(map: IMapItem<K, V>[]) {
        return map_store = map;
    }

    function toTrueMap(): TTruemapItem<K,V>[] {
        let new_store: TTruemapItem<K,V>[] = []
        map_store.forEach((item) => {
            new_store.push([item.key, item.value])
        })
        return new_store
    }

    const operators = {
        set,
        get,
        getAll,
        has,
        del,
        entries,
        keys,
        values,
        length,
    };

    const aliases = {
        delete: del,
        all: getAll,
    };

    const manager = {
        clear,
        insert,
        replace,
        toTrueMap
    };

    return {
        ...operators,
        ...aliases,
        manager,
    };
}

export type TTruemapItem<K,V> = [K,V]

export function trueMap<K=any,V=any>() {
//? let map_store: [K,V][] = [];
    let map_store: TTruemapItem<K,V>[] = Array();

    function entries(): [K, V][] {
        return [...map_store];  // TrueMap already stores as [K,V] pairs
    }

    function keys(): K[] {
        return map_store.map(item => item[0]);
    }

    function values(): V[] {
        return map_store.map(item => item[1]);
    }

    function length(): number {
        return map_store.length;
    }

    function set(key: K, value: V) {
        // console.trace('set', key, value)
        if (has(key)) del(key);
        return map_store.push([key,value])
    }

    function get(key: K): V | undefined{
        const item = map_store.find(
            (_item) => _item[0] === key
        )
        if (item) {
            return item[1];
        } else {
            console.error(new Error('Key not found'))
            return undefined
        }
    }

    function has(key: K): boolean {
        try {
        return map_store.some(item => item[0] === key)
        } catch (e) {
            // console.error('error in has', e)
            return false
        }
    }

    function del(key: K): TTruemapItem<K,V>[] {
        return map_store = map_store.filter(item => item[0] !== key)
    }

    // function getAll(): TTruemapItem<K,V>[] {
    //     return map_store
    // }
    function clear(): never[] {
        return map_store = [];
    }
    function insert(map: TTruemapItem<K, V>[]) {
        return map_store = [...map_store, ...map];
    }
    function replace(map: TTruemapItem<K, V>[]) {
        return map_store = map;
    }

    function toHumanMap(): IMapItem<K,V>[] {
        let new_store: IMapItem<K,V>[] = []
        map_store.forEach((item) => {
            new_store.push({key:item[0],value:item[1]})
        })
        return new_store
    }


    const operators = {
        set,
        get,
        has,
        del,
        entries,
        keys,
        values,
        length,
    };

    const aliases = {
        delete: del,
        all: entries,
        getAll: entries,
    };

    const manager = {
        clear,
        insert,
        replace,
        toHumanMap
    };

    return {
        ...operators,
        ...aliases,
        manager,
        size: 0
        // get size() {
        //     return map_store.length
        // },
        // map_store
    };
}