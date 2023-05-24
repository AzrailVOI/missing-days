
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Windows.Input;

namespace Missing_days;

public partial class MissingPage : ContentPage
{
	public class UserInGroup
    {
        public string user_id { get; set; }
        public string name { get; set; }
		public bool missing { get; set; }
		public string reason { get; set; }
        public Color background_color { get; set; }
        public bool canEditMissing { get; set; }
    }
	public class GroupInPair
    {
        public string name { get; set; }
        public Color background_color { get; set; }
        public List<UserInGroup> usersInGroup { get; set; }
    }
    public ObservableCollection<GroupInPair> groupsInPair = new ObservableCollection<GroupInPair>();
    public static ObservableCollection<GroupInPair> staticGroupsInPair = new ObservableCollection<GroupInPair>();
    public static string schedule_id;
    public static string subject_name;
    public static DateOnly day;
    public static int pair_number;
    public static bool canEditMissing;
    public MissingPage()
    {
        this.groupsInPair = staticGroupsInPair;
        for (int i = 0; i < groupsInPair.Count; i++)
        {
            for (int j = 0; j < groupsInPair[i].usersInGroup.Count; j++)
            {
                groupsInPair[i].usersInGroup[j].canEditMissing = canEditMissing;
            }
        }
        InitializeComponent();
        BindingContext = this;
        collectionViewGroupInPair.ItemsSource = groupsInPair;
        InvalidateMeasure();
        //ForceLayout();
    }
    protected override void OnAppearing()
    {
        base.OnAppearing();
    }
    public void SendCheck()
    {
        CheckData checkData = new CheckData();
        checkData.sc_id = schedule_id;
        checkData.su = subject_name;
        checkData.sk = App.singleton.userData.session_key;
        checkData.cu = new List<CheckUserData>();
        for (int i = 0; i < groupsInPair.Count; i++)
        {
            for (int j = 0; j < groupsInPair[i].usersInGroup.Count; j++)
            {
                CheckUserData checkUserData = new CheckUserData();
                checkUserData.u = groupsInPair[i].usersInGroup[j].user_id;
                checkUserData.m = (groupsInPair[i].usersInGroup[j].missing?3:(string.IsNullOrEmpty(groupsInPair[i].usersInGroup[j].reason)?1:2));
                if(checkUserData.m != 3)
                {
                    checkUserData.r = groupsInPair[i].usersInGroup[j].reason;
                }
                else
                {
                    checkUserData.r = "";
                }
                {
                    for (int ii = 0; ii < App.singleton.weekResponse.sc.Count; ii++)
                    {
                        for (int jj = 0; jj < App.singleton.weekResponse.sc[ii].p.Count; jj++)
                        {
                            if(App.singleton.weekResponse.sc[ii].p[jj].sc_id == schedule_id)
                            {
                                for (int u = 0; u < App.singleton.weekResponse.sc[ii].p[jj].us.Count; u++)
                                {
                                    if (App.singleton.weekResponse.sc[ii].p[jj].us[u].u == checkUserData.u)
                                    {
                                        if(checkUserData.r != App.singleton.weekResponse.sc[ii].p[jj].us[u].r || App.singleton.weekResponse.sc[ii].p[jj].us[u].m != checkUserData.m)
                                        {
                                            checkData.cu.Add(checkUserData);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        App.singleton.SendMessage(MessageEnum.checkData, JsonConvert.SerializeObject(checkData));
    }
    private void OnButtonSendClicked(object sender, EventArgs e)
    {
        SendCheck();
        Back();
    }
    private async void Back()
    {
        await AppShell.singleton.Navigation.PopAsync();
    }
    private void CheckBox_CheckedChanged(object sender, CheckedChangedEventArgs e)
    {
        CheckBox checkBox = (CheckBox)sender;
        if (checkBox != null)
        {
            UserInGroup userInGroup = (UserInGroup)checkBox.BindingContext;
            if (userInGroup != null)
            {
                for (int i = 0; i < groupsInPair.Count; i++)
                {
                    for (int j = 0; j < groupsInPair[i].usersInGroup.Count; j++)
                    {
                        if(groupsInPair[i].usersInGroup[j].user_id == userInGroup.user_id)
                        {
                            //groupsInPair[i].usersInGroup[j].missing = e.Value;
                            Debug.WriteLine("UserId:" + userInGroup.user_id + ":" + e.Value.ToString());
                            break;
                        }
                    }
                }
            }
        }
    }

    private void Entry_Completed(object sender, EventArgs e)
    {
        Editor entry = (Editor)sender;
        if (entry != null)
        {
            UserInGroup userInGroup = (UserInGroup)entry.BindingContext;
            if (userInGroup != null)
            {
                for (int i = 0; i < groupsInPair.Count; i++)
                {
                    for (int j = 0; j < groupsInPair[i].usersInGroup.Count; j++)
                    {
                        if (groupsInPair[i].usersInGroup[j].user_id == userInGroup.user_id)
                        {
                            Debug.WriteLine("UserId:" + userInGroup.user_id + ":" + entry.Text.ToString());
                            break;
                        }
                    }
                }
            }
        }
    }

}