

using System.Collections.ObjectModel;
using System.Diagnostics;

namespace Missing_days;

public partial class AppSettingxaml : ContentPage
{
    private DateTime selectedDateTime;
    private DateTime selectedDateOnly;
    private TimeSpan selectedTimeOnly;
    public List<string> themeList { get; set; }
    public AppSettingxaml()
    {
        //Application.Current.UserAppTheme = AppTheme.Unspecified;
        themeList = new List<string> { "Светлая", "Темная", "Системная" };
        //Debug.WriteLine("SimulatedDateTime=" + selectedDateTime.ToShortDateString() + "|" + selectedDateTime.ToShortTimeString());
        if (Preferences.Get("simulateDateTime", false))
        {
            selectedDateTime = Preferences.Get("simulatedDateTime", selectedDateTime);
        }
        else
        {
            selectedDateTime = DateTime.Now;
        }
        selectedDateOnly = selectedDateTime;
        selectedTimeOnly = selectedDateTime.TimeOfDay;
        InitializeComponent();
        pickerTheme.ItemsSource = themeList;
        DatePickerSimulatedDateTime.Date = selectedDateOnly;
        TimePickerSimulatedDateTime.Time = selectedTimeOnly;
        pickerTheme.SelectedIndex = Preferences.Get("theme", 0);
        activityConnect.IsRunning = false;
        if (App.singleton.webSocket != null)
        {
            //Debug.WriteLine("Add event");
            App.singleton.webSocket.OnConnected += WebSocket_OnConnected;
            App.singleton.webSocket.OnConnectedFail += WebSocket_OnConnectedFail;
            App.singleton.webSocket.OnDisconected += WebSocket_OnDisconected;
        }
    }
    protected override void OnAppearing()
    {
        base.OnAppearing();
        entryIp.Text = Preferences.Get("ip", "");
        entryPort.Text = Preferences.Get("port", 5000).ToString();
        checkBoxSimulateDateTime.IsChecked = Preferences.Get("simulateDateTime", false);
        if (App.singleton.webSocket != null)
        {
            checkBoxConnected.IsChecked = App.singleton.webSocket.Connected;
            buttonConnect.Text = App.singleton.webSocket.Connected ? "Отключиться" : "Подключиться";
            checkBoxSimulateServer.IsEnabled = !App.singleton.webSocket.Connected;
        }
        else
        {
            checkBoxConnected.IsChecked = false;
            buttonConnect.Text = "Подключиться";
            buttonConnect.IsEnabled = true;
            checkBoxSimulateServer.IsEnabled = true;
        }
    }
    private void WebSocket_OnDisconected(object sender)
    {
        //App.singleton.mainActionQueue.Enqueue(() =>
        {
            Debug.WriteLine("WebSocket_OnDisconected ");
            checkBoxConnected.IsChecked = false;
            buttonConnect.IsEnabled = true;
            buttonConnect.Text = "Подключиться";
            activityConnect.IsRunning = false;
            checkBoxSimulateServer.IsEnabled = false;
        }//);
    }

    private void WebSocket_OnConnectedFail(object sender)
    {
        //App.singleton.mainActionQueue.Enqueue(() =>
        {
            Debug.WriteLine("WebSocket_OnConnectedFail ");
            checkBoxConnected.IsChecked = false;
            buttonConnect.IsEnabled = true;
            buttonConnect.Text = "Подключиться";
            activityConnect.IsRunning = false;
            checkBoxSimulateServer.IsEnabled = true;
        }//);
    }

    private void WebSocket_OnConnected(object sender, bool connected)
    {
        //App.singleton.mainActionQueue.Enqueue(() =>
        {
            Debug.WriteLine("WebSocket_OnConnected " + connected);
            checkBoxConnected.IsChecked = connected;
            buttonConnect.IsEnabled = true;
            buttonConnect.Text = connected ? "Отключиться" : "Подключиться";
            activityConnect.IsRunning = false;
            checkBoxSimulateServer.IsEnabled = false;
        }//);
    }

    private void OnEntryIpChanged(object sender, EventArgs e)
    {
        Preferences.Set("ip", entryIp.Text);
    }
    private void OnEntryPortChanged(object sender, EventArgs e)
    {
        if(int.TryParse(entryPort.Text,out int port))
        {
            Preferences.Set("port", port);
        }
        else
        {

        }
    }

    private void OnButtonConnectClicked(object sender, EventArgs e)
    {
        if (buttonConnect.IsEnabled)
        {
            if (App.singleton.webSocket.Connected)
            {
                buttonConnect.Text = "Подключиться";
                App.singleton.Disconnect();
            }
            else
            {
                buttonConnect.IsEnabled = false;
                activityConnect.IsRunning = true;
                checkBoxSimulateServer.IsEnabled = false;
                App.singleton.Connect();
            }
        }
    }
    private void OnButtonTestClicked(object sender, EventArgs e)
    {
        if (App.singleton.webSocket.Connected)
        {
            App.singleton.SendMessage("Hello, server!");
        }
    }

    private void OnCheckBoxSimulateServerCheckedChanged(object sender, CheckedChangedEventArgs e)
    {
        if (checkBoxSimulateServer.IsEnabled)
        {
            App.singleton.simulateServer = checkBoxSimulateServer.IsChecked;
        }
    }

    private void OnCheckBoxSimulateDateTimeCheckedChanged(object sender, CheckedChangedEventArgs e)
    {
        if(checkBoxSimulateDateTime.IsChecked != Preferences.Get("simulateDateTime", false))
        {
          Preferences.Set("simulateDateTime", checkBoxSimulateDateTime.IsChecked);
        }
    }

    private void OnDateSimulatedDateTimeSelected(object sender, DateChangedEventArgs e)
    {
        if (DatePickerSimulatedDateTime != null && TimePickerSimulatedDateTime != null)
        {
            selectedDateTime = DateOnly.FromDateTime(DatePickerSimulatedDateTime.Date).ToDateTime(TimeOnly.FromTimeSpan(TimePickerSimulatedDateTime.Time));
            Preferences.Set("simulatedDateTime", selectedDateTime);
            //Debug.WriteLine("SimulatedDateTime=" + selectedDateTime.ToShortDateString() + "|" + selectedDateTime.ToShortTimeString());
        }
    }

    private void OnTimePickerSimulatedDateTimeChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if(DatePickerSimulatedDateTime != null && TimePickerSimulatedDateTime != null)
        {
            selectedDateTime = DateOnly.FromDateTime(DatePickerSimulatedDateTime.Date).ToDateTime(TimeOnly.FromTimeSpan(TimePickerSimulatedDateTime.Time));
            Preferences.Set("simulatedDateTime", selectedDateTime);
            //Debug.WriteLine("SimulatedDateTime=" + selectedDateTime.ToShortDateString() + "|" + selectedDateTime.ToShortTimeString());
        }
    }

    private void OnPickerThemeSelectedIndexChanged(object sender, EventArgs e)
    {
        if(pickerTheme.SelectedIndex == 0)
        {
            Application.Current.UserAppTheme = AppTheme.Light;
        }
        else
        {
            if (pickerTheme.SelectedIndex == 1)
            {
                Application.Current.UserAppTheme = AppTheme.Dark;
            }
            else
            {
                Application.Current.UserAppTheme = Application.Current.RequestedTheme;
            }
        }
        Preferences.Set("theme", pickerTheme.SelectedIndex);
    }
}