

using Newtonsoft.Json;
using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Preferences = Microsoft.Maui.Storage.Preferences;
#if WINDOWS
using Microsoft.UI;
using Microsoft.UI.Windowing;
using Windows.Graphics;
#endif
namespace Missing_days;

public partial class App : Application
{
    public static App singleton;
    public bool simulateServer = false;
    public DateTime SimulatedDateTime { get { return Preferences.Get("simulateDateTime", false) ? Preferences.Get("simulatedDateTime",DateTime.Now):DateTime.Now; } set { Preferences.Set("simulatedDateTime", value); } }
    public UserData userData;
    public bool loginActiving = false;
    public string moderateUserLogin;
    public int moderateUserRole;
    public WeekResponse weekResponse;
    public StatisticResponse statisticResponse;
    public BeforeStatisticResponse beforeStatisticResponse;
    public WebSocketClient webSocket;
    public Queue<Action> mainActionQueue = new Queue<Action>();
    const int WindowWidth = 640;
    const int WindowHeight = 1080;
    public App()
    {
        singleton = this;
        if (!Preferences.ContainsKey("ip"))
        {
            Preferences.Set("ip", "26.177.6.179");
        }
        if (!Preferences.ContainsKey("port"))
        {
            Preferences.Set("port", 5001);
        }
        if (!Preferences.ContainsKey("saveUserLogin"))
        {
            Preferences.Set("saveUserLogin", false);
        }
        if (!Preferences.ContainsKey("login"))
        {
            Preferences.Set("login", "");
        }
        if (!Preferences.ContainsKey("password"))
        {
            Preferences.Set("password", "");
        }
        if (!Preferences.ContainsKey("simulateDateTime"))
        {
            Preferences.Set("simulateDateTime", false);
        }
        if (!Preferences.ContainsKey("theme"))
        {
            Preferences.Set("theme", 2);
        }
        webSocket = new WebSocketClient();
        
        InitializeComponent();
        int theme = Preferences.Get("theme", 2);
        if (theme == 0)
        {
            Application.Current.UserAppTheme = AppTheme.Light;
        }
        else
        {
            if (theme == 1)
            {
                Application.Current.UserAppTheme = AppTheme.Dark;
            }
            else
            {
                Application.Current.UserAppTheme = Application.Current.RequestedTheme;
            }
        }
        Microsoft.Maui.Handlers.WindowHandler.Mapper.AppendToMapping(nameof(IWindow), (handler, view) =>
        {
#if WINDOWS
            var mauiWindow = handler.VirtualView;
            var nativeWindow = handler.PlatformView;
            nativeWindow.Activate();
            IntPtr windowHandle = WinRT.Interop.WindowNative.GetWindowHandle(nativeWindow);
            WindowId windowId = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(windowHandle);
            AppWindow appWindow = Microsoft.UI.Windowing.AppWindow.GetFromWindowId(windowId);
            appWindow.Resize(new SizeInt32(WindowWidth, WindowHeight));
#endif
        });
        MainPage = new AppShell();
        Timer();
        TimerConnect();
        Connect();
    }
    #region Timers
    public async void Timer()
    {
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));

        while (await timer.WaitForNextTickAsync())
        {
            if(webSocket != null)
            {
                if (webSocket.actionQueue.Count > 0)
                {
                    webSocket.actionQueue.Dequeue().Invoke();
                }
                if (mainActionQueue.Count > 0)
                {
                    mainActionQueue.Dequeue().Invoke();
                }
            }
        }
    }
    public async void TimerConnect()
    {
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));

        while (await timer.WaitForNextTickAsync())
        {
            if (webSocket != null)
            {
                if (!webSocket.Connected && webSocket.State != WebSocketState.Open)
                {
                    Connect();
                }
            }
        }
    }
    #endregion
    #region Connection
    public async void Connect()
    {
        if (Microsoft.Maui.Storage.Preferences.ContainsKey("ip") && Microsoft.Maui.Storage.Preferences.ContainsKey("port"))
        {
            string address = $"ws://{Preferences.Get("ip","127.0.0.1")}:{Preferences.Get("port", 5000)}";
            await webSocket.Connect(address);
            Debug.WriteLine("Connect end on " + address);
        }

    }
    public async void Disconnect()
    {
        if (webSocket != null)
        {
            await webSocket.Disconnect();
        }
    }
    public void Login(string username, string password)
    {
        loginActiving = true;
        string check = JsonConvert.SerializeObject(new LoginData(username, password));
        Debug.WriteLine("Send login and password: " + check);
        App.singleton.SendMessage(MessageEnum.loginData, check);
    }
    #endregion
    #region Send
    public async void SendMessage(string message)
    {
        SendMessage(MessageEnum.message, message);
    }
    public async void SendMessage(MessageEnum messageEnum, string message)
    {
        if (webSocket != null)
        {
            await webSocket.Send(messageEnum==MessageEnum.none?"":((int)messageEnum) + ":" + message);
        }
    }
    #endregion
    #region Get
    public static string GetMissingImage(MissingEnum missingEnum)
    {
        switch (missingEnum)
        {
            default:
            case MissingEnum.none:
                return "";
            case MissingEnum.noRespect:
                return ("xmark_solid.png");
            case MissingEnum.respect:
                return ("file_contract_solid.png");
            case MissingEnum.exist:
                return ("check_solid.png");
        }
    }
    public static Color GetMissingColor(MissingEnum missingEnum)
    {
        switch (missingEnum)
        {
            default:
            case MissingEnum.none:
                return Color.FromArgb("#FFFFFF");
            case MissingEnum.noRespect:
                return Color.FromArgb("#FFDBDB");
            case MissingEnum.respect:
                return Color.FromArgb("#FFF1CF");
            case MissingEnum.exist:
                return Color.FromArgb("#E1FFE0");
        }
    }
    #endregion
    #region Crypt
    public static string EncryptMessage(string message, byte[] key)
    {
        try
        {
            using (var aes = new AesManaged())
            {
                aes.Key = key;
                aes.IV = new byte[16];
                aes.Mode = CipherMode.CBC;

                using (var encryptor = aes.CreateEncryptor())
                using (var msEncrypt = new MemoryStream())
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    var messageBytes = Encoding.UTF8.GetBytes(message);
                    csEncrypt.Write(messageBytes, 0, messageBytes.Length);
                    csEncrypt.FlushFinalBlock();
                    var encryptedMessageBytes = msEncrypt.ToArray();
                    return Convert.ToBase64String(encryptedMessageBytes);
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("EncryptMessage fail" + ex.Message);
            return "";
        }
    }
    public static string DecryptMessage(string encryptedMessage, byte[] key)
    {
        try
        {
            using (var aes = new AesManaged())
            {
                aes.Key = key;
                aes.IV = new byte[16]; // Нулевой вектор инициализации
                aes.Mode = CipherMode.CBC;

                var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
                var encryptedMessageBytes = Convert.FromBase64String(encryptedMessage);

                var decryptedMessageBytes = decryptor.TransformFinalBlock(encryptedMessageBytes, 0, encryptedMessageBytes.Length);
                return Encoding.UTF8.GetString(decryptedMessageBytes);
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine("DecryptMessage fail" + ex.Message);
            return "";
        }
    }
    #endregion
}
