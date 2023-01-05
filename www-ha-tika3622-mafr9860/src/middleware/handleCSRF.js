import { encode as base64Encode } from 'https://deno.land/std/encoding/base64.ts';

export const generateToken = () => {
    const array = new Uint32Array(64);
    crypto.getRandomValues(array);
    const result = base64Encode(array);
    console.log("Token: " + result);
    return result;
}