class TypeDef<T = unknown> {
    byteLength = 1;

    decode: (view: DataView, offset: number) => T;
    encode: (view: DataView, offset: number, v: T) => void;

    constructor({
        byteLength,
        decode,
        encode,
    }: {
        byteLength: number;
        decode?: (view: DataView, offset: number) => T;
        encode?: (view: DataView, offset: number, v: T) => void;
    }) {
        this.byteLength = byteLength || 1;
        this.decode = decode;
        this.encode = encode;
        return new Proxy(this, {
            get: (obj, key) => {
                if (typeof key === 'string' && Number.isInteger(Number(key))) {
                    const unitCount = Number(key);
                    return new Proxy(this, {
                        get: (obj, key) => {
                            if (key === 'decode') {
                                const decode = obj.decode;
                                const byteLength = obj.byteLength;
                                return (view: DataView, offset: number): T[] => {
                                    const arr: T[] = [];
                                    for (let i = 0; i < unitCount; i++) {
                                        arr.push(decode(view, offset));
                                        offset += byteLength;
                                    }
                                    return arr;
                                };
                            } else if (key === 'encode') {
                                const encode = obj.encode;
                                const byteLength = obj.byteLength;
                                return (view: DataView, offset: number, v: any[]): T[] => {
                                    const arr: T[] = [];
                                    for (let i = 0; i < unitCount; i++) {
                                        encode(view, offset, v[i]);
                                        offset += byteLength;
                                    }
                                    return arr;
                                };
                            } else if (key === 'byteLength') {
                                return unitCount * obj.byteLength;
                            }
                            return obj[key];
                        },
                    });
                }
                return obj[key];
            },
        });
    }
}

class StructDef<T = unknown> extends TypeDef<T> {
    constructor(defs: T) {
        const byteLength = Object.keys(defs)
            .map((key) => defs[key].byteLength)
            .reduce((s, v) => s + v, 0);
        super({
            byteLength,
            decode: (view, offset) => {
                const obj = {} as any;
                Object.keys(defs).forEach((key) => {
                    const def = defs[key];
                    if (offset >= view.byteLength) return;
                    obj[key] = def.decode(view, offset);
                    offset += def.byteLength;
                });
                return obj;
            },
            encode: (view, offset, obj) => {
                Object.keys(defs).forEach((key) => {
                    const def = defs[key];
                    if (offset >= view.byteLength) return;
                    def.encode(view, offset, obj[key]);
                    offset += def.byteLength;
                });
            },
        });
    }

    parse(buf: ArrayBufferLike | ArrayLike<number>): { [K in keyof T]: T[K] } {
        if (Reflect.has(buf, 'buffer')) {
            buf = buf['buffer'];
        } else if (Array.isArray(buf)) {
            buf = new Uint8Array(buf).buffer;
        }
        const view = new DataView(buf as ArrayBuffer);
        return this.decode(view, 0);
    }

    pack(obj: any) {
        const buf = new ArrayBuffer(this.byteLength);
        const view = new DataView(buf);
        this.encode(view, 0, obj);
        return buf;
    }
}

export function struct(defs: any) {
    return new StructDef(defs);
}

export const int = new TypeDef<number>({
    byteLength: 4,
    decode: (view: DataView, offset: number) => {
        return view.getInt32(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setInt32(offset, v);
    },
});

export const int32_t = new TypeDef<number>({
    byteLength: 4,
    decode: (view: DataView, offset: number) => {
        return view.getInt32(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setInt32(offset, v);
    },
});

export const uint32_t = new TypeDef<number>({
    byteLength: 4,
    decode: (view: DataView, offset: number) => {
        return view.getUint32(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setUint32(offset, v);
    },
});

export const int16_t = new TypeDef<number>({
    byteLength: 2,
    decode: (view: DataView, offset: number) => {
        return view.getInt16(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setInt16(offset, v);
    },
});

export const uint16_t = new TypeDef<number>({
    byteLength: 2,
    decode: (view: DataView, offset: number) => {
        return view.getUint16(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setUint16(offset, v);
    },
});

export const int8_t = new TypeDef<number>({
    byteLength: 1,
    decode: (view: DataView, offset: number) => {
        return view.getInt8(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setInt8(offset, v);
    },
});

export const uint8_t = new TypeDef<number>({
    byteLength: 1,
    decode: (view: DataView, offset: number) => {
        return view.getUint8(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setUint8(offset, v);
    },
});

export const float = new TypeDef<number>({
    byteLength: 4,
    decode: (view: DataView, offset: number) => {
        return view.getFloat32(offset);
    },
    encode: (view: DataView, offset: number, v: number) => {
        view.setFloat32(offset, v);
    },
});

// Big-Endian是默认的
export const BE = (type: TypeDef<number>) => type;

export const LE = (type: TypeDef<number>) =>
    new TypeDef<number>({
        byteLength: type.byteLength,
        decode: (view: DataView, offset: number) => {
            const bytes = new ArrayBuffer(type.byteLength);
            const leView = new DataView(bytes);
            for (let i = 0; i < type.byteLength; i++) {
                leView.setUint8(type.byteLength - 1 - i, view.getUint8(offset + i));
            }
            return type.decode(leView, 0);
        },
        encode: (view: DataView, offset: number, v: number) => {
            const bytes = new ArrayBuffer(type.byteLength);
            const leView = new DataView(bytes);
            type.encode(leView, 0, v);
            for (let i = 0; i < type.byteLength; i++) {
                view.setUint8(offset + i, leView.getUint8(type.byteLength - 1 - i));
            }
        },
    });

export const INT16_MAX = 0x7fff;
export const INT16_MIN = -INT16_MAX - 1;
export const UINT16_MAX = 0xffff;
export const INT32_MAX = 0x7fffffff;
export const INT32_MIN = -0x7fffffff - 1;
export const UINT32_MAX = 0xffffffff;
