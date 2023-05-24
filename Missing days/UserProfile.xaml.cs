
using LiveChartsCore;
using LiveChartsCore.SkiaSharpView.Painting;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.Measure;
using Newtonsoft.Json;
using SkiaSharp;
using System.Diagnostics;
using static CommunityToolkit.Mvvm.ComponentModel.__Internals.__TaskExtensions.TaskAwaitableWithoutEndValidation;

namespace Missing_days;

public partial class UserProfile : ContentPage
{
    public string name { get; set; }
    public string role { get; set; }
    public string login { get; set; }
    public string email { get; set; }
    public string phone { get; set; }
    public UserProfile()
    {
        InitializeComponent();
        BindingContext = this;
    }

    protected override void OnAppearing()
    {
        GetDataModel();
        base.OnAppearing();
    }
    private void GetDataModel()
    {
        if (App.singleton.userData != null)
        {
            name = App.singleton.userData.last_name + " " + App.singleton.userData.first_name + " " + App.singleton.userData.middle_name;
            role = ProjectUtility.GetRoleName((RoleEnum)App.singleton.userData.role_id);
            login = App.singleton.userData.login;
            email = App.singleton.userData.email;
            phone = App.singleton.userData.phone;
            entryName.Text = name;
            entryRole.Text = role;
            entryLogin.Text = login;
            entryEmail.Text = email;
            entryPhone.Text = phone;

        }
    }
    private void OnButtonLoginOutClicked(object sender, EventArgs e)
    {
        App.singleton.mainActionQueue.Enqueue(() =>
        {
            ToLogin();
            AppShell.singleton.LogOut();
        });
    }
    private async void ToLogin()
    {
        //await Shell.Current.GoToAsync(nameof(MainPage));
        //await Navigation.PushAsync(new MainPage(), false);
        //Navigation.RemovePage(this);
    }
}