using Newtonsoft.Json;
using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;

namespace Missing_days;

public partial class MainPage : ContentPage
{
	int count = 0;

	public MainPage()
	{
		InitializeComponent();
        AppShell.singleton.OnUserLoginIn += Singleton_OnUserLoginIn;
        App.singleton.webSocket.OnConnected += WebSocket_OnConnected;
        App.singleton.webSocket.OnConnectedFail += WebSocket_OnConnectedFail;
        App.singleton.webSocket.OnDisconected += WebSocket_OnDisconected;
        CheckLoginButtonEnabled();
        checkBoxSaveLogin.IsChecked = Preferences.Get("saveUserLogin", false);
        entryLogin.Text = Preferences.Get("login", "");
        entryPassword.Text = Preferences.Get("password", "");
        CheckLoginButtonEnabled();
    }
    private void WebSocket_OnConnectedFail(object sender)
    {
        CheckLoginButtonEnabled();
        ActivityIndicatorLogin.IsRunning = false;
        App.singleton.loginActiving = false;
    }

    private void CheckLoginButtonEnabled()
    {
        bool t = !App.singleton.loginActiving && App.singleton.webSocket != null && App.singleton.webSocket.Connected && 
            entryLogin.Text != null && entryLogin.Text.Length >= 3 && 
            entryPassword.Text != null && entryPassword.Text.Length >= 4;
        if(ButtonLogin.IsEnabled != t)
        {
            ButtonLogin.IsEnabled = t;
        }
        if (!App.singleton.loginActiving)
        {
            ActivityIndicatorLogin.IsRunning = false;
        }
    }

    private void WebSocket_OnDisconected(object sender)
    {
        CheckLoginButtonEnabled();
        ActivityIndicatorLogin.IsRunning = false;
        App.singleton.loginActiving = false;
    }

    private void WebSocket_OnConnected(object sender, bool connected)
    {
        CheckLoginButtonEnabled();
    }

    private void Singleton_OnUserLoginIn(object sender)
    {
        ActivityIndicatorLogin.IsRunning = false;
        ToUserProfile();
        //Application.Current.MainPage = new UserProfile();
    }
    private async void ToUserProfile()
    {
        Shell.Current.GoToAsync(nameof(UserProfile));
        //await Navigation.PushAsync(new UserProfile(), false);
        //Navigation.RemovePage(this);
    }
    protected override void OnAppearing()
    {
		if(App.singleton.userData != null)
        {
            ToUserProfile();
        }
		else
        {
            CheckLoginButtonEnabled();
            base.OnAppearing();
        }
    }
    private void OnCounterClicked(object sender, EventArgs e)
	{
		//count++;

		//if (count == 1)
		//	CounterBtn.Text = $"Clicked {count} time";
		//else
		//	CounterBtn.Text = $"Clicked {count} times";

		//SemanticScreenReader.Announce(CounterBtn.Text);
    }
    private void OnButtonLoginClicked(object sender, EventArgs e)
    {
        if (ButtonLogin.IsEnabled && !App.singleton.loginActiving)
        {
            //ButtonLogin.IsEnabled = false;
            ActivityIndicatorLogin.IsRunning = true;
            if (Preferences.Get("saveUserLogin", false))
            {
                Preferences.Set("login", entryLogin.Text);
                Preferences.Set("password", entryPassword.Text);
            }
            App.singleton.Login(entryLogin.Text, entryPassword.Text);
        }
    }
    private void OnEntryLoginTextChanged(object sender, TextChangedEventArgs e)
    {
        CheckLoginButtonEnabled();
    }
    private void OnEntryPasswordTextChanged(object sender, TextChangedEventArgs e)
    {
        CheckLoginButtonEnabled();
    }
    private void OnCheckBoxSaveLoginCheckChanged(object sender, CheckedChangedEventArgs e)
    {
        Preferences.Set("saveUserLogin", checkBoxSaveLogin.IsChecked);
    }
}

