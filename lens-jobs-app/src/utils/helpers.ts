import { encodeAbiParameters, parseAbiParameter } from "viem";

export function encodeValue(value: any, paramStr: string){
    const encoded = encodeAbiParameters(
      [parseAbiParameter(paramStr)],
      [value]
    );
    return encoded;
}