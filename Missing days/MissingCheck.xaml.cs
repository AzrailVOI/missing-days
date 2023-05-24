using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Globalization;
using System.Windows.Input;

namespace Missing_days;

public class PairInDay
{
    public bool current { get; set; }
    public string time { get; set; }
    public string schedule_id { get; set; }
    public string subject_name { get; set; }
    public string subject_type { get; set; }
    public string room_number { get; set; }
    public string reason { get; set; }
    public string teacher_group { get; set; }
    public string teacher_name { get; set; }
    public Color background_color { get; set; }
    public string check_image { get; set; }

    public ObservableCollection<MissingPage.GroupInPair> groupsInPair;
    public DateTime dateTime;
    public DateOnly day;
    public int pair_number;
    public ICommand FrameClickedCommand { get; }

    public PairInDay()
    {
        FrameClickedCommand = new Command<string>(FrameClicked);
    }

    private void FrameClicked(string reason)
    {
        if(groupsInPair == null)
        {
            if (!string.IsNullOrEmpty(reason))
            {
                AppShell.singleton.DisplayReason(reason);
            }
        }
        else
        {
            if(App.singleton.SimulatedDateTime.Ticks >= dateTime.Ticks)
            {
                MissingPage.canEditMissing = (App.singleton.SimulatedDateTime.Ticks <= dateTime.AddHours(2).Ticks && App.singleton.SimulatedDateTime.Ticks >= dateTime.Ticks);
                MissingPage.staticGroupsInPair = groupsInPair;
                MissingPage.subject_name = subject_name;
                MissingPage.schedule_id = schedule_id;
                MissingPage.day = day;
                MissingPage.pair_number = pair_number;
                AppShell.singleton.Navigation.PushAsync(new MissingPage());
            }
        }
    }
}
public partial class MissingCheck : ContentPage
{
    public struct YearWeek
    {
        public YearWeek(int year, int week)
        {
            this.year = year;
            this.week = week;
        }

        public int year { get; set; }
        public int week { get; set; }
    }
    public class DayInWeek
    {
        public string name { get; set; }
        public bool current { get; set; }
        public int pairCount { get { return pairInDays == null ? 0 : pairInDays.Count; } }
        public List<PairInDay> pairInDays { get; set; }
        public Color background_color { get; set; }
    }
    public ObservableCollection<DayInWeek> dayInWeeks = new ObservableCollection<DayInWeek>();
    public Dictionary<YearWeek, WeekResponse> weeksResponce = new Dictionary<YearWeek, WeekResponse>();
    public DateOnly currentTargetDate;
    public DateOnly minDate;
    public DateOnly maxDate;
    public MissingCheck()
    {
        dayInWeeks = new ObservableCollection<DayInWeek>();
        currentTargetDate = DateOnly.FromDateTime(App.singleton.SimulatedDateTime);
        InitializeComponent();
        BindingContext = this;
        dayCollectionView.ItemsSource = dayInWeeks;
        AppShell.singleton.OnUserLoginOut += Singleton_OnUserLoginOut;
    }
    protected override void OnAppearing()
    {
        base.OnAppearing();
        AppShell.singleton.OnWeekResponse += OnWeekResponse;
        TryGetWeekFromMemory();
    }

    private void Singleton_OnUserLoginOut(object sender)
    {
        weeksResponce.Clear();
        dayInWeeks.Clear();
    }

    protected override void OnDisappearing()
    {
        AppShell.singleton.OnWeekResponse -= OnWeekResponse;
        base.OnDisappearing();
    }
    private void WeekRequest()
    {
        activityIndicatorRefresh.IsRunning = true;
        App.singleton.SendMessage(MessageEnum.weekRequest, JsonConvert.SerializeObject(new WeekRequest(App.singleton.userData.session_key, currentTargetDate)));
    }
    private bool TryGetWeekFromMemory()
    {
        int weekNumber = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(currentTargetDate.ToDateTime(TimeOnly.MinValue), CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        YearWeek yearWeek = new YearWeek(currentTargetDate.Year, weekNumber);
        if (weeksResponce.ContainsKey(yearWeek))
        {
            activityIndicatorRefresh.IsRunning = true;
            App.singleton.weekResponse = weeksResponce[yearWeek];
            DrawWeek();
            return true;
        }
        else
        {
            WeekRequest();
            return false;
        }
    }
    private void DrawWeek()
    {
        dayInWeeks.Clear();
        minDate = currentTargetDate;
        maxDate = currentTargetDate;
        App.singleton.weekResponse.sc.Sort((DaySchedule p1, DaySchedule p2) => p1.d > p2.d ? 1 : -1);
        for (int i = 0; i < App.singleton.weekResponse.sc.Count; i++)
        {
            DayInWeek dayInWeek = new DayInWeek();
            if (App.singleton.weekResponse.sc[i].d < minDate)
            {
                minDate = App.singleton.weekResponse.sc[i].d;
            }
            if (App.singleton.weekResponse.sc[i].d > maxDate)
            {
                maxDate = App.singleton.weekResponse.sc[i].d;
            }

            dayInWeek.name = App.singleton.weekResponse.sc[i].d.Day.ToString() + " " + CultureInfo.GetCultureInfo("ru-RU").DateTimeFormat.GetDayName(App.singleton.weekResponse.sc[i].d.DayOfWeek).ToString();
            dayInWeek.pairInDays = new List<PairInDay>();
            dayInWeek.current = DateOnly.FromDateTime(App.singleton.SimulatedDateTime) == App.singleton.weekResponse.sc[i].d;
            if (dayInWeek.current)
            {
                Debug.WriteLine(dayInWeek.name + " - Current");
                if (Application.Current.Resources.TryGetValue("Secondary", out object color))
                {
                    dayInWeek.background_color = (Color)color;
                }
                else
                {
                    dayInWeek.background_color = Color.FromRgb(1, 0, 0);
                }
            }
            else
            {
                if (Application.Current.Resources.TryGetValue("Gray100", out object color))
                {
                    dayInWeek.background_color = (Color)color;
                }
                else
                {
                    dayInWeek.background_color = Color.FromRgb(1, 0, 0);
                }
            }
            App.singleton.weekResponse.sc[i].p.Sort((PairSchedule p1, PairSchedule p2) => p1.p > p2.p ? 1 : -1);
            for (int j = 0; j < App.singleton.weekResponse.sc[i].p.Count; j++)
            {
                PairInDay pairInDay = new PairInDay();
                TimeOnly timeOnly = TimeOnly.Parse("08:30:00");
                int pairNumber = App.singleton.weekResponse.sc[i].p[j].p;
                if (pairNumber > 1)
                {
                    for (int t = 1; t < pairNumber; t++)
                    {
                        timeOnly = timeOnly.AddMinutes(100);
                        if (t == 3)
                        {
                            timeOnly = timeOnly.AddMinutes(20);
                        }
                    }
                }
                pairInDay.current = dayInWeek.current && timeOnly.Ticks <= TimeOnly.FromDateTime(App.singleton.SimulatedDateTime).Ticks && TimeOnly.FromDateTime(App.singleton.SimulatedDateTime).Ticks <= timeOnly.AddMinutes(90).Ticks;
                if (dayInWeek.current)
                {
                    Debug.WriteLine(timeOnly.Ticks + "<=" + TimeOnly.FromDateTime(App.singleton.SimulatedDateTime).Ticks + "<=" + timeOnly.AddMinutes(90).Ticks + " | pairInDay.current = " + pairInDay.current);   
                }
                pairInDay.time = timeOnly.ToString("HH:mm") + "-" + timeOnly.AddMinutes(90).ToString("HH:mm");
                pairInDay.dateTime = App.singleton.weekResponse.sc[i].d.ToDateTime(timeOnly);
                pairInDay.schedule_id = App.singleton.weekResponse.sc[i].p[j].sc_id;
                pairInDay.subject_name = App.singleton.weekResponse.sc[i].p[j].su;
                pairInDay.subject_type = App.singleton.weekResponse.sc[i].p[j].st;
                pairInDay.room_number = "ауд." + App.singleton.weekResponse.sc[i].p[j].r;
                if (pairInDay.current)
                {
                    if (Application.Current.Resources.TryGetValue("Selected", out object color))
                    {
                        pairInDay.background_color = (Color)color;
                    }
                    else
                    {
                        pairInDay.background_color = App.GetMissingColor(MissingEnum.none);
                    }
                }
                else
                {
                    if (App.singleton.SimulatedDateTime.Ticks < pairInDay.dateTime.Ticks)
                    {
                        if (Application.Current.Resources.TryGetValue("Gray200", out object color))
                        {
                            pairInDay.background_color = (Color)color;
                        }
                        else
                        {
                            pairInDay.background_color = App.GetMissingColor(MissingEnum.none);
                        }
                    }
                    else
                    {
                        pairInDay.background_color = App.GetMissingColor(MissingEnum.none);
                    }
                }
                if(App.singleton.moderateUserRole == (int)RoleEnum.student)
                {
                    if (App.singleton.weekResponse.sc[i].p[j].us != null && App.singleton.weekResponse.sc[i].p[j].us.Count > 0)
                    {
                        pairInDay.teacher_group = App.singleton.weekResponse.sc[i].p[j].us[0].g;
                        pairInDay.teacher_name = App.singleton.weekResponse.sc[i].p[j].us[0].n;
                        if ((RoleEnum)App.singleton.userData.role_id == RoleEnum.student)
                        {
                            pairInDay.check_image = App.GetMissingImage((MissingEnum)App.singleton.weekResponse.sc[i].p[j].us[0].m);
                            if (App.singleton.weekResponse.sc[i].p[j].us[0].m == 0)
                            {
                            }
                            else
                            {
                                pairInDay.background_color = App.GetMissingColor((MissingEnum)App.singleton.weekResponse.sc[i].p[j].us[0].m);
                            }
                            pairInDay.reason = App.singleton.weekResponse.sc[i].p[j].us[0].r;
                        }
                        else
                        {
                            pairInDay.check_image = App.GetMissingImage(MissingEnum.none);
                        }
                    }
                    else
                    {
                        pairInDay.teacher_name = "Учитель " + j.ToString();
                    }
                }
                else
                {
                    ObservableCollection<MissingPage.GroupInPair> groupInPair = new ObservableCollection<MissingPage.GroupInPair>();
                    List<string> groups = new List<string>();
                    for (int u = 0; u < App.singleton.weekResponse.sc[i].p[j].us.Count; u++)
                    {
                        if (!groups.Contains(App.singleton.weekResponse.sc[i].p[j].us[u].g))
                        {
                            groups.Add(App.singleton.weekResponse.sc[i].p[j].us[u].g);
                            groupInPair.Add(new MissingPage.GroupInPair());
                            groupInPair[groupInPair.Count - 1].name = App.singleton.weekResponse.sc[i].p[j].us[u].g;
                            if (Application.Current.Resources.TryGetValue("Gray100", out object color1))
                            {
                                groupInPair[groupInPair.Count - 1].background_color = (Color)color1;
                            }
                            else
                            {
                                groupInPair[groupInPair.Count - 1].background_color = Color.FromRgb(1, 0, 0);
                            }
                            groupInPair[groupInPair.Count-1].usersInGroup = new List<MissingPage.UserInGroup>();
                        }
                        int index = 0;
                        for (int g = 0; g < groupInPair.Count; g++)
                        {
                            if (groupInPair[g].name == App.singleton.weekResponse.sc[i].p[j].us[u].g)
                            {
                                index = g;
                                break;
                            }
                        }
                        MissingPage.UserInGroup userInGroup = new MissingPage.UserInGroup();
                        if (Application.Current.Resources.TryGetValue("White", out object color))
                        {
                            userInGroup.background_color = (Color)color;
                        }
                        else
                        {
                            userInGroup.background_color = Color.FromRgb(1, 0, 0);
                        }
                        userInGroup.user_id = App.singleton.weekResponse.sc[i].p[j].us[u].u;
                        userInGroup.name = App.singleton.weekResponse.sc[i].p[j].us[u].n;
                        userInGroup.missing = App.singleton.weekResponse.sc[i].p[j].us[u].m==3;
                        userInGroup.reason = App.singleton.weekResponse.sc[i].p[j].us[u].r;
                        groupInPair[index].usersInGroup.Add(userInGroup);
                    }
                    string s = "";
                    for (int g = 0; g < groups.Count; g++)
                    {
                        s += groups[g] + (g!=groups.Count-1?",":"");
                    }
                    pairInDay.groupsInPair = groupInPair;
                    pairInDay.schedule_id = App.singleton.weekResponse.sc[i].p[j].sc_id;
                    pairInDay.day = App.singleton.weekResponse.sc[i].d;
                    pairInDay.pair_number = App.singleton.weekResponse.sc[i].p[j].p;
                    pairInDay.teacher_group = s;
                }
                dayInWeek.pairInDays.Add(pairInDay);
            }
            dayInWeeks.Add(dayInWeek);
        }

        int weekNumber = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(currentTargetDate.ToDateTime(TimeOnly.MinValue), CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        bool isEvenWeek = (weekNumber % 2 == 0);
        if (minDate == maxDate)
        {
            labelTittle.Text = (weekNumber.ToString() + "- Неделя: " + (isEvenWeek ? " Четная" : " Нечетная"));
        }
        else
        {
            labelTittle.Text = minDate.ToString("dd.MM.yyyy") + " - " + maxDate.ToString("dd.MM.yyyy") + (isEvenWeek ? " Четная" : " Нечетная");
        }
        activityIndicatorRefresh.IsRunning = false;
        //dayCollectionView.ItemsSource = dayInWeeks;
        try
        {
            InvalidateMeasure();
            //ForceLayout();
            base.OnAppearing();
        }
        catch(Exception ex)
        {
            Debug.WriteLine("ForceLayout exception: " + ex.Message);
        }
    }
    private void RandomFillAndSend()
    {
        for (int i = 0; i < dayInWeeks.Count; i++)
        {
            for (int j = 0; j < dayInWeeks[i].pairInDays.Count; j++)
            {
                bool fillThisPair = false;
                for (int g = 0; g < dayInWeeks[i].pairInDays[j].groupsInPair.Count; g++)
                {
                    for (int u = 0; u < dayInWeeks[i].pairInDays[j].groupsInPair[g].usersInGroup.Count; u++)
                    {
                        if (dayInWeeks[i].pairInDays[j].groupsInPair[g].usersInGroup[u].missing)
                        {

                        }
                    }
                }
            }
        }
    }
    private void OnWeekResponse(object sender)
    {
        activityIndicatorRefresh.IsRunning = false;
        if (App.singleton.weekResponse != null)
        {
            Debug.WriteLine("OnWeekResponse");
            int weekNumber = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(currentTargetDate.ToDateTime(TimeOnly.MinValue), CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
            YearWeek yearWeek = new YearWeek(currentTargetDate.Year, weekNumber);
            if (weeksResponce.ContainsKey(yearWeek))
            {
                weeksResponce[yearWeek] = JsonConvert.DeserializeObject<WeekResponse>(JsonConvert.SerializeObject(App.singleton.weekResponse));
            }
            else
            {
                weeksResponce.Add(yearWeek, App.singleton.weekResponse);
            }
            DrawWeek();
        }
    }

    private void OnButtonPrevClicked(object sender, EventArgs e)
    {
        currentTargetDate = currentTargetDate.AddDays(-7);
        TryGetWeekFromMemory();
    }
    private void OnButtonNextClicked(object sender, EventArgs e)
    {
        currentTargetDate = currentTargetDate.AddDays(7);
        TryGetWeekFromMemory();
    }
    private void OnFrameClicked(object sender, EventArgs e)
    {

    }

    private void OnButtonRefreshClicked(object sender, EventArgs e)
    {
        WeekRequest();
    }
    private void OnButtonFillClicked(object sender, EventArgs e)
    {
        RandomFillAndSend();
    }
}