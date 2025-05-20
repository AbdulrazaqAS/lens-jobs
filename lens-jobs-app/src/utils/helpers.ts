import { encodeAbiParameters, parseAbiParameter, decodeAbiParameters, toBytes, decodeFunctionResult } from "viem";
import JobPostApplyActionABI from "../assets/jobPostApplyActionABI.json";

export function encodeValue(value: any, paramStr: string) {
  const encoded = encodeAbiParameters(
    [parseAbiParameter(paramStr)],
    [value]
  );
  return encoded;
}

export function decodeValue(value: `0x${string}`, paramStr: string) {
  // const decoded = decodeFunctionResult({
  //   abi: JobPostApplyActionABI,
  //   functionName: 'applicationFormUris',
  //   data: value,
  // });

  const values = decodeAbiParameters(
  [
    { name: "response", type: "bytes" },
  ],
  '0x' +
  '0000000000000000000000000000000000000000000000000000000000000020' + // offset pointer
  '0000000000000000000000000000000000000000000000000000000000000020' + // length
  '0000000000000000000000000000000000000000000000000000000000000001' as `0x${string}`,  // data
  )
  console.log("Values", values);

  // const rawBytes = decoded as [`0x${string}`];
  // const decodedStr = new TextDecoder().decode(toBytes(rawBytes[0]));
  // return decodedStr;
  console.log("Lenght", value.length);
  console.log("Value", value);
  const decoded = decodeAbiParameters(
    [{ name: "appFormUri", type: "bytes" }],
    value.substring(0, 2) + 
    value.substring(2, 66) +
    value.substring(66, 130) +
    value.substring(130, 194) as `0x${string}`
  );
  console.log("Value", value);
  console.log("Decoded", decoded);
  // bytes to string
  const decodedStr = new TextDecoder().decode(toBytes(decoded[0] as string));
  return decodedStr
}