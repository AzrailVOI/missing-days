using Newtonsoft.Json;
using System.Diagnostics;
using System.Text;

namespace Missing_days;

public partial class AppShell : Shell
{
    public static AppShell singleton;
    public delegate void VoidHandler(object sender);
    public event VoidHandler OnUserLoginIn;
    public event VoidHandler OnUserLoginOut;
    public event VoidHandler OnWeekResponse;
    public event VoidHandler OnStatisticResponse;
    public event VoidHandler OnBeforeStatisticResponse;
    public AppShell()
    {
        singleton = this;
        InitializeComponent();
        Timer();
        OnUserLoginIn += AppShell_OnUserLoginIn;
        OnUserLoginOut += AppShell_OnUserLoginOut;
        CurrentItem = ShellContentLogin;
    }
    public void LogOut()
    {
        App.singleton.userData = null;
        OnUserLoginOut(this);
    }
    private void AppShell_OnUserLoginOut(object sender)
    {
        Current.CurrentItem = ShellContentLogin;
        UpdateFlyoutItems();
    }

    private void AppShell_OnUserLoginIn(object sender)
    {
        Current.CurrentItem = ShellContentUserProfile;
        UpdateFlyoutItems();
    }
    public async void DisplayReason(string reason)
    {
        await DisplayAlert("Причина отсутствия:", reason, "OK");
    }
    private void UpdateFlyoutItems()
    {
        if (App.singleton.userData != null)
        {
            //Current.CurrentItem = ShellContentUserProfile;

            ShellContentLogin.FlyoutItemIsVisible = false;
            ShellContentLogin.IsVisible = false;

            ShellContentUserProfile.FlyoutItemIsVisible = true;
            ShellContentUserProfile.IsVisible = true;

            ShellContentMissingCheck.FlyoutItemIsVisible = true;
            ShellContentMissingCheck.IsVisible = true;

            ShellContentStatisticPage.FlyoutItemIsVisible = true;
            ShellContentStatisticPage.IsVisible = true;
        }
        else
        {
            //Current.CurrentItem = ShellContentLogin;

            ShellContentLogin.FlyoutItemIsVisible = true;
            ShellContentLogin.IsVisible = true;

            ShellContentUserProfile.FlyoutItemIsVisible = false;
            ShellContentUserProfile.IsVisible = false;

            ShellContentMissingCheck.FlyoutItemIsVisible = false;
            ShellContentMissingCheck.IsVisible = false;

            ShellContentStatisticPage.FlyoutItemIsVisible = false;
            ShellContentStatisticPage.IsVisible = false;
        }
    }
    protected override void OnAppearing()
    {
        UpdateFlyoutItems();
        base.OnAppearing();
    }
    public DateTime DateTimeNow()
    {
        return DateTime.Now;
    }
    public async void Timer()
    {
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));

        while (await timer.WaitForNextTickAsync())
        {
            if (App.singleton.webSocket.received.Count > 0)
            {
                string received = App.singleton.webSocket.received.Dequeue();
                string[] data = received.Split(':', 2);
                if(data.Length == 2)
                {
                    string message = "";
                    if (data[1] != null)
                    {
                        message = data[1];
                    }
                    //Debug.WriteLine("data[0]: " + data[0]);
                    //Debug.WriteLine("data[1]: " + message);
                    if (int.TryParse(data[0], out int intType))
                    {
                        MessageEnum messageEnum = (MessageEnum)intType;
                        try
                        {
                            switch (messageEnum)
                            {
                                case MessageEnum.none:
                                    break;
                                case MessageEnum.message:
                                    App.singleton.loginActiving = false;
                                    Debug.WriteLine("Message from server" + message);
                                    await DisplayAlert("Сообщение от сервера", message, "OK");
                                    break;
                                case MessageEnum.loginData:
                                    LoginData login = JsonConvert.DeserializeObject<LoginData>(message);
                                    Debug.WriteLine("Login " + login.login);
                                    Debug.WriteLine("Password " + login.password);
                                    break;
                                case MessageEnum.userData:
                                    App.singleton.loginActiving = false;
                                    App.singleton.userData = JsonConvert.DeserializeObject<UserData>(message);
                                    if (App.singleton.userData != null)
                                    {
                                        App.singleton.moderateUserRole = App.singleton.userData.role_id;
                                        App.singleton.moderateUserLogin = App.singleton.userData.login;
                                        OnUserLoginIn(this);
                                        await DisplayAlert("Вы вошли как", ProjectUtility.GetRoleName((RoleEnum)App.singleton.userData.role_id), "OK");
                                    }
                                    break;
                                case MessageEnum.weekResponse:
                                    App.singleton.weekResponse = JsonConvert.DeserializeObject<WeekResponse>(message);
                                    if (App.singleton.weekResponse != null)
                                    {
                                        Debug.WriteLine("App.singleton.weekResponse");
                                        //for (int i = 0; i < App.singleton.weekResponse.schedules.Count; i++)
                                        {

                                        }
                                        if (OnWeekResponse != null)
                                        {
                                            OnWeekResponse(this);
                                        }
                                        //await DisplayAlert("Пришло", "Дней: " + App.singleton.weekResponse.schedules.Count.ToString() + "", "OK");
                                    }
                                    break;
                                case MessageEnum.secretKey:
                                    App.singleton.webSocket.SetKey(message);
                                    if(Preferences.Get("saveUserLogin", false))
                                    {
                                        App.singleton.Login(Preferences.Get("login", ""), Preferences.Get("password", ""));
                                    }
                                    break;
                                case MessageEnum.statisticResponse:
                                    App.singleton.statisticResponse = JsonConvert.DeserializeObject<StatisticResponse>(message);
                                    if (App.singleton.statisticResponse != null)
                                    {
                                        Debug.WriteLine("App.singleton.statisticResponse");
                                        if (OnStatisticResponse != null)
                                        {
                                            OnStatisticResponse(this);
                                        }
                                        //await DisplayAlert("Пришло", "Дней: " + App.singleton.weekResponse.schedules.Count.ToString() + "", "OK");
                                    }
                                    break;
                                case MessageEnum.beforeStatisticResponse:
                                    App.singleton.beforeStatisticResponse = JsonConvert.DeserializeObject<BeforeStatisticResponse>(message);
                                    if (App.singleton.beforeStatisticResponse != null)
                                    {
                                        Debug.WriteLine("App.singleton.beforeStatisticResponse");
                                        if (OnBeforeStatisticResponse != null)
                                        {
                                            OnBeforeStatisticResponse(this);
                                        }
                                        //await DisplayAlert("Пришло", "Дней: " + App.singleton.weekResponse.schedules.Count.ToString() + "", "OK");
                                    }
                                    break;
                            }
                        }
                        catch(Exception ex)
                        {
                            Debug.WriteLine("Exception: " + ex.Message);
                        }
                    }
                }
                else
                {
                    Debug.WriteLine("data.Length =" + data.Length);
                }
                
            }
        }
    }
}
