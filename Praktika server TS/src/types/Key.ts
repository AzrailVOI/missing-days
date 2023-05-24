export interface KeyPair {
  publicKey: string | Buffer;
  privateKey: string | Buffer;
}

export interface EncryptionPayload {
  publicKey: string;
  plainText: string;
}

export interface DecryptionPayload {
  privateKey: string;
  cipherText: string;
}