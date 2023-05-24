using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Diagnostics;

namespace Missing_days
{
    public class WebSocketClient
    {
        private ClientWebSocket webSocket;
        public WebSocketState State { get { return webSocket != null ? webSocket.State : WebSocketState.None; } }
        private bool connected;
        private byte[] key;
        private RsaEncryptionService rsa = new RsaEncryptionService();
        public Queue<string> received = new Queue<string>();
        public Dictionary<string, Dictionary<int, string>> hardMessage;
        public Queue<Action> actionQueue = new Queue<Action>();
        private static RSACryptoServiceProvider rsaProvider;
        public bool Connected
        {
            get => connected; private set
            {
                connected = value;
                if (OnConnected != null)
                {
                    Debug.WriteLine("OnConnected(this, value);");
                    OnConnected(this, value);
                }
            }
        }
        public delegate void OnConnectedEventHandler(object sender, bool connected);
        public delegate void OnConnectedFailEventHandler(object sender);
        public event OnConnectedEventHandler OnConnected;
        public event OnConnectedFailEventHandler OnConnectedFail;
        public event OnConnectedFailEventHandler OnDisconected;
        public WebSocketClient()
        {
            Init();
        }
        public void Init()
        {
            webSocket = new ClientWebSocket();
            key = null;
        }
        public async Task Connect(string url)
        {
            rsaProvider = new RSACryptoServiceProvider(2048);
            try
            {
                await webSocket.ConnectAsync(new Uri(url), CancellationToken.None);
                Debug.WriteLine("Connected to server.");
                await Task.Factory.StartNew(async () =>
                {
                    while (webSocket.State == WebSocketState.Open)
                    {
                        if (!connected)
                        {
                            actionQueue.Enqueue(() =>
                            {
                                Connected = true;
                                SendPublic();
                                StartReceive();
                            });
                            break;
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                Init();
                actionQueue.Enqueue(() =>
                {
                    if (OnConnectedFail != null)
                    {
                        OnConnectedFail(this);
                    }
                });
                Debug.WriteLine("Fail to connect: " + ex.Message);
            }
        }
        public async Task Disconnect()
        {
            try
            {
                if (webSocket.State != WebSocketState.Aborted)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    Connected = false;
                    Debug.WriteLine("Disconnected from server.");
                    actionQueue.Enqueue(() =>
                    {
                        if (OnDisconected != null)
                        {
                            OnDisconected(this);
                        }
                    });
                }
                else
                {
                    Init();
                    Connected = false;
                    actionQueue.Enqueue(() =>
                    {
                        if (OnDisconected != null)
                        {
                            OnDisconected(this);
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                Init();
                Connected = false;
                actionQueue.Enqueue(() =>
                {
                    if (OnDisconected != null)
                    {
                        OnDisconected(this);
                    }
                });
                Debug.WriteLine("Disconnected from server... " + ex.Message);
            }
        }
        public async Task Send(string message)
        {
            try
            {
                if(key != null)
                {
                    Debug.WriteLine("Send: " + message);
                    await SendWithoutEncrypt(App.EncryptMessage(message, key));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Fail to send encrypt: " + ex.Message);
                await Disconnect();
            }
        }
        public void SetKey(string decryptedKey)
        {
            string s = rsa.Decrypt(decryptedKey);
            Debug.WriteLine(" Decrypt: " + s);
            key = Convert.FromBase64String(s);
            //key = buffer;
            Debug.WriteLine(" Length: " + key.Length.ToString() + "Set key: " + s + " ");
        }
        public async Task SendWithoutEncrypt(string message)
        {
            try
            {
                if (webSocket.State == WebSocketState.Open)
                {
                    var buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(message));
                    await webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    Debug.WriteLine("Sent message to server: " + message);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Fail to send: " + ex.Message);
                await Disconnect();
            }
        }
        public async void StartReceive()
        {
            await Task.Factory.StartNew(Receive);
        }
        public async void SendPublic()
        {
            await SendWithoutEncrypt((int)MessageEnum.publicKey + ":" + rsa.GetPemPublicKey());
        }
        public async Task Receive()
        {
            while (webSocket.State == WebSocketState.Open)
            {
                try
                {
                    var buffer = new ArraySegment<byte>(new byte[1024]);
                    var result = await webSocket.ReceiveAsync(buffer, CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        //await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        await Disconnect();
                        Debug.WriteLine("Connection closed by server.");
                    }
                    else
                    {
                        string message = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
                        Debug.WriteLine("Received undecrypted message from server: " + message);
                        string[] data = message.Split(':', 3);
                        if (data.Length == 3)
                        {
                            string[] data2 = data[0].Split('|', 2);
                            int index = 0;
                            int count = 0;
                            if (data2.Length == 2)
                            {
                                if (int.TryParse(data2[0], out int r1))
                                {
                                    index = r1;
                                    //Debug.WriteLine("index: " + index);
                                }
                                if (int.TryParse(data2[1], out int r2))
                                {
                                    count = r2;
                                }
                            }
                            string check = data[1];
                            //Debug.WriteLine(index + "|" + count + ":" + check);
                            if (hardMessage == null) { hardMessage = new Dictionary<string, Dictionary<int, string>>(); }
                            if (hardMessage.ContainsKey(check))
                            {
                                hardMessage[check].Add(index, data[2]);
                                //Debug.WriteLine("Add " + data[2] + " to " + check);
                            }
                            else
                            {
                                Dictionary<int, string> keyValuePairs = new Dictionary<int, string>();
                                keyValuePairs.Add(index, data[2]);
                                hardMessage.Add(check, keyValuePairs);
                                //Debug.WriteLine("Add " + data[2] + " to " + check);
                            }
                            if (hardMessage[check].Count == count)
                            {
                                //Debug.WriteLine(check + ".Count == " + count);
                                bool t = true;
                                string fullMessage = "";
                                for (int i = 1; i <= count; i++)
                                {
                                    if (hardMessage[check].ContainsKey(i))
                                    {
                                        fullMessage += hardMessage[check][i];
                                    }
                                    else
                                    {
                                        t = false;
                                        break;
                                    }
                                }
                                if (t)
                                {
                                    //Debug.WriteLine("fullMessage = " + fullMessage);
                                    hardMessage.Remove(check);
                                    if(key != null)
                                    {
                                        string decryptedMessage = App.DecryptMessage(fullMessage, key);
                                        Debug.WriteLine("Received message from server: " + decryptedMessage);
                                        received.Enqueue(decryptedMessage);
                                    }
                                    else
                                    {
                                        received.Enqueue(fullMessage);
                                        Debug.WriteLine("Received (without key) message from server: " + fullMessage);
                                    }
                                }
                                else
                                {
                                    Debug.WriteLine("Fail received message from server: " + check);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Fail to receive: " + ex.Message);
                    await Disconnect();
                    break;
                }
            }
        }
    }
}