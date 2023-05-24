import {WebSocket} from "ws";
import { crc32 } from 'crc';
export function ws_Send(ws: WebSocket, message: string) {
  const maxFragmentSize = 1000; // Максимальный размер фрагмента
  let FragmentNumber = 0;
  const AllFragments = [];
  const checksum = crc32(message).toString(16).padStart(8, '0');
  for (let i = 0; i < message.length; i += maxFragmentSize) {
    FragmentNumber++
    const isLastFragment = i + maxFragmentSize >= message.length;
    const fragmentSize = isLastFragment ? message.length - i : maxFragmentSize;
    const fragment = message.substring(i, i + fragmentSize);
    AllFragments.push(fragment)
  }
  AllFragments.map((fragment, index:number)=>{
    index++
    console.log(`${index}|${FragmentNumber}:${checksum}:` + fragment);
    ws.send(`${index}|${FragmentNumber}:${checksum}:` + fragment);
  })
}