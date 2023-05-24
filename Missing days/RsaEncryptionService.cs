using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace Missing_days
{
    public class RsaEncryptionService
    {
        private static RSACryptoServiceProvider csp = new RSACryptoServiceProvider(2048);
        private RSAParameters privateKey;
        private RSAParameters publicKey;
        public RsaEncryptionService()
        {
            privateKey = csp.ExportParameters(true);
            publicKey = csp.ExportParameters(false);
        }
        public string GetPublicKey()
        {
            StringWriter sw = new StringWriter();
            XmlSerializer xmlSerializer = new XmlSerializer(typeof(RSAParameters));
            xmlSerializer.Serialize(sw, publicKey);
            return sw.ToString();
        }
        public string GetPemPublicKey()
        {

            // Преобразуем публичный ключ в формат PEM
            string publicKeyPem = "-----BEGIN RSA PUBLIC KEY-----\n" +
                                  Convert.ToBase64String(csp.ExportRSAPublicKey(), Base64FormattingOptions.InsertLineBreaks) +
                                  "\n-----END RSA PUBLIC KEY-----";
            return publicKeyPem;
        }
        public string GetPrivateKey()
        {
            StringWriter sw = new StringWriter();
            XmlSerializer xmlSerializer = new XmlSerializer(typeof(RSAParameters));
            xmlSerializer.Serialize(sw, privateKey);
            return sw.ToString();
        }
        public string Encrypt(string message)
        {
            csp = new RSACryptoServiceProvider();
            csp.ImportParameters(publicKey);
            var dataBytes = Encoding.UTF8.GetBytes(message);
            var cypherData = csp.Encrypt(dataBytes, false);
            return Convert.ToBase64String(cypherData);
        }
        public string Decrypt(string message)
        {
            try
            {
                var dataBytes = Convert.FromBase64String(message);
                csp.ImportParameters(privateKey);
                var plaintextBytes = csp.Decrypt(dataBytes, RSAEncryptionPadding.Pkcs1);
                return Encoding.UTF8.GetString(plaintextBytes);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Fail to Decrypt: " + ex.Message);
                return "";
            }
        }
    }
}
