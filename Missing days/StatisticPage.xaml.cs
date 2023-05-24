using LiveChartsCore.Measure;
using LiveChartsCore.SkiaSharpView.Painting;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore;
using Microsoft.Maui.ApplicationModel.Communication;
using Newtonsoft.Json;
using SkiaSharp;
using static Microsoft.Maui.ApplicationModel.Permissions;
using System.Data;
using System.Diagnostics;
using System.Xml.Linq;
using System.Collections.ObjectModel;

namespace Missing_days;

public partial class StatisticPage : ContentPage
{
    public class PickerItem
    {
        public string Name { get; set; }
        public string Id { get; set; }
    }
    public ObservableCollection<string> pickerDateList { get; set; }
    public ObservableCollection<PickerItem> pickerSubjectList { get; set; }
    public ObservableCollection<PickerItem> pickerSubjectTypeList { get; set; }
    public ObservableCollection<PickerItem> pickerGroupList { get; set; }
    public ObservableCollection<PickerItem> pickerStudentList { get; set; }
    public BarViewModel barViewModel { get; set; }
    public string selectDate;
    public string selectSubject;
    public string selectSubjectType;
    public string selectGroup;
    public string selectStudent;
    public StatisticPage()
	{
        barViewModel = new BarViewModel();
        pickerDateList = new ObservableCollection<string> { "День", "Неделя", "Две недели", "Месяц", "Полгода" };
        pickerSubjectList = new ObservableCollection<PickerItem> { new PickerItem { Name="Все предметы", Id="" } };
        pickerSubjectTypeList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все типы", Id = "" }  };
        pickerGroupList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все группы", Id = "" }  };
        pickerStudentList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все студенты", Id = "" }  };
        InitializeComponent();
        BindingContext = this;
        pickerDate.SelectedIndex = 1;
        pickerSubject.SelectedIndex = 0;
        pickerSubjectType.SelectedIndex = 0;
        pickerGroup.SelectedIndex = 0;
        pickerStudent.SelectedIndex = 0;
        AppShell.singleton.OnStatisticResponse += Singleton_OnStatisticResponse;
        AppShell.singleton.OnBeforeStatisticResponse += Singleton_OnBeforeStatisticResponse;
    }
    protected override void OnDisappearing()
    {
        base.OnDisappearing();
    }
    protected override void ChangeVisualState()
    {
        base.ChangeVisualState();
    }
    protected override void OnAppearing()
    {
        pickerStudent.IsVisible = (RoleEnum)App.singleton.moderateUserRole != RoleEnum.student;
        if ((RoleEnum)App.singleton.moderateUserRole == RoleEnum.student)
        {
            if (pickerStudent.SelectedIndex != 0)
            {
                pickerStudent.SelectedIndex = 0;
            }
        }
        RequestBefore();
        base.OnAppearing();
    }
    private void Singleton_OnBeforeStatisticResponse(object sender)
    {
        RequestStatistic();
        int index = 0;
        if (App.singleton.beforeStatisticResponse != null)
        {
            index = pickerSubject.SelectedIndex;
            pickerSubject.ItemsSource.Clear();
            ObservableCollection<PickerItem> subjectList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все предметы", Id = "" } };
            pickerSubject.ItemsSource = subjectList;
            for (int i = 0; i < App.singleton.beforeStatisticResponse.su.Count; i++)
            {
                subjectList.Add(new PickerItem { Name = App.singleton.beforeStatisticResponse.su[i].n, Id = App.singleton.beforeStatisticResponse.su[i].id });
            }
            //pickerSubjectList = subjectList;
            pickerSubject.SelectedIndex = Math.Min(index, subjectList.Count - 1);
            Debug.WriteLine("pickerSubjectList " + subjectList.Count);
            //pickerSubject.IsVisible = subjectList.Count > 1;

            index = pickerSubjectType.SelectedIndex;
            pickerSubjectType.ItemsSource.Clear();
            ObservableCollection<PickerItem> subjectTypeList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все типы", Id = "" } };
            pickerSubjectType.ItemsSource = subjectTypeList;
            for (int i = 0; i < App.singleton.beforeStatisticResponse.sut.Count; i++)
            {
                subjectTypeList.Add(new PickerItem { Name = App.singleton.beforeStatisticResponse.sut[i].n, Id = App.singleton.beforeStatisticResponse.sut[i].id });
            }
            pickerSubjectType.SelectedIndex = Math.Min(index, subjectTypeList.Count - 1);
            Debug.WriteLine("pickerSubjectTypeList " + subjectTypeList.Count);
            //pickerSubjectType.IsVisible = subjectTypeList.Count > 1;

            index = pickerGroup.SelectedIndex;
            pickerGroup.ItemsSource.Clear();
            ObservableCollection<PickerItem> groupList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все группы", Id = "" } };
            pickerGroup.ItemsSource = groupList;
            for (int i = 0; i < App.singleton.beforeStatisticResponse.g.Count; i++)
            {
                groupList.Add(new PickerItem { Name= App.singleton.beforeStatisticResponse.g[i].n, Id= App.singleton.beforeStatisticResponse.g[i].id });
            }
            pickerGroup.SelectedIndex = Math.Min(index, groupList.Count - 1);
            Debug.WriteLine("pickerGroupList " + groupList.Count);
            //pickerGroup.IsVisible = groupList.Count > 1;

            index = pickerStudent.SelectedIndex;
            pickerStudent.ItemsSource.Clear();
            ObservableCollection<PickerItem> studentList = new ObservableCollection<PickerItem> { new PickerItem { Name = "Все студенты", Id = "" } };
            pickerStudent.ItemsSource = studentList;
            for (int i = 0; i < App.singleton.beforeStatisticResponse.st.Count; i++)
            {
                studentList.Add(new PickerItem { Name = App.singleton.beforeStatisticResponse.st[i].n, Id = App.singleton.beforeStatisticResponse.st[i].id });
            }
            pickerStudent.SelectedIndex = Math.Min(index, studentList.Count - 1);
            Debug.WriteLine("pickerStudentList " + studentList.Count);
            //pickerStudent.IsVisible = studentList.Count > 1;
        }
        base.ChangeVisualState();

        base.OnDisappearing();
        base.OnAppearing();
    }

    private void Singleton_OnStatisticResponse(object sender)
    {
        Debug.WriteLine("Singleton_OnStatisticResponse");
        List<string> labels = new List<string>();
        List<int> maxList = new List<int>();
        List<int> no_respectList = new List<int>();
        List<int> respect = new List<int>();
        List<int> exist = new List<int>();
        for (int i = 0; i < App.singleton.statisticResponse.sd.Count; i++)
        {
            labels.Add(App.singleton.statisticResponse.sd[i].d.ToShortDateString());
            maxList.Add(App.singleton.statisticResponse.sd[i].m);
            no_respectList.Add(App.singleton.statisticResponse.sd[i].nr);
            respect.Add(App.singleton.statisticResponse.sd[i].r);
            exist.Add(App.singleton.statisticResponse.sd[i].e);
        }

        ISeries[] Series =
        {
            new StackedColumnSeries<int>
            {
                Name = "Посещений",
                Values = exist.ToArray(),
                Stroke = null,
                Fill = new SolidColorPaint(SKColor.Parse("#6aa84f")),
                IgnoresBarPosition = true,
                DataLabelsPaint = new SolidColorPaint(new SKColor(45, 45, 45)),
                DataLabelsSize = 14,
                DataLabelsPosition = DataLabelsPosition.Middle

            },
            new StackedColumnSeries<int>
            {
                Name = "Пропусков по уважительной",
                Values = respect.ToArray(),
                Stroke = null,
                Fill = new SolidColorPaint(SKColor.Parse("#ffe599")),
                IgnoresBarPosition = true,
                DataLabelsPaint = new SolidColorPaint(new SKColor(45, 45, 45)),
                DataLabelsSize = 14,
                DataLabelsPosition = DataLabelsPosition.Middle
            },
            new StackedColumnSeries<int>
            {
                Name = "Пропусков без уважительной",
                Values = no_respectList.ToArray(),
                Stroke = null,
                Fill = new SolidColorPaint(SKColor.Parse("#f4cccc")),
                IgnoresBarPosition = true,
                DataLabelsPaint = new SolidColorPaint(new SKColor(45, 45, 45)),
                DataLabelsSize = 14,
                DataLabelsPosition = DataLabelsPosition.Middle
            }
        };
        Axis[] XAxes =
        {
            new Axis { 
                //MinLimit = 0,
                //MaxLimit = 10,
                Labels = labels.ToArray(),
                MinStep = 1
            }
        };
        chart.Series = Series;
        chart.XAxes = XAxes;
        //dataModel.barViewModel.listList = listList;
        //dataModel.barViewModel.UpdateValues();
        //dataModel.barViewModel

        base.OnDisappearing();
        base.OnAppearing();
    }
    private void RequestBefore()
    {
        if (pickerDate.SelectedItem != null && pickerSubject.SelectedItem != null && pickerGroup.SelectedItem != null && pickerStudent.SelectedItem != null && pickerSubjectType.SelectedItem != null)
        {
            int days = -7;
            switch ((string)pickerDate.SelectedItem)
            {
                default:
                case "День":
                    days = -1;
                    break;
                case "Неделя":
                    days = -7;
                    break;
                case "Две недели":
                    days = -14;
                    break;
                case "Месяц":
                    days = -31;
                    break;
                case "Полгода":
                    days = -183;
                    break;
            }
            BeforeStatisticRequest beforeStatisticRequest = new BeforeStatisticRequest(App.singleton.userData.session_key, DateOnly.FromDateTime(App.singleton.SimulatedDateTime.AddDays(days)), DateOnly.FromDateTime(App.singleton.SimulatedDateTime), ((PickerItem)pickerSubject.SelectedItem).Id, ((PickerItem)pickerSubjectType.SelectedItem).Id, ((PickerItem)pickerGroup.SelectedItem).Id, ((PickerItem)pickerStudent.SelectedItem).Id);
            Debug.WriteLine("((PickerItem)pickerSubject.SelectedItem).Id - " + ((PickerItem)pickerSubject.SelectedItem).Id);
            //Debug.WriteLine("pickerSubject.SelectedIndex - " + pickerSubject.SelectedIndex + "App.singleton.beforeStatisticResponse.su[pickerSubject.SelectedIndex-1].id - " + App.singleton.beforeStatisticResponse.su[pickerSubject.SelectedIndex - 1].id);
            App.singleton.SendMessage(MessageEnum.beforeStatisticRequest, JsonConvert.SerializeObject(beforeStatisticRequest));
        }
    }
    private void RequestStatistic()
    {
        if (pickerDate.SelectedItem != null && pickerSubject.SelectedItem != null && pickerGroup.SelectedItem != null && pickerStudent.SelectedItem != null && pickerSubjectType.SelectedItem != null)
        {
            int days = -7;
            switch ((string)pickerDate.SelectedItem)
            {
                default:
                case "День":
                    days = -1;
                    break;
                case "Неделя":
                    days = -7;
                    break;
                case "Две недели":
                    days = -14;
                    break;
                case "Месяц":
                    days = -31;
                    break;
                case "Полгода":
                    days = -183;
                    break;
            }
            StatisticRequest statisticRequest = new StatisticRequest(App.singleton.userData.session_key, DateOnly.FromDateTime(App.singleton.SimulatedDateTime.AddDays(days)), DateOnly.FromDateTime(App.singleton.SimulatedDateTime), ((PickerItem)pickerSubject.SelectedItem).Id, ((PickerItem)pickerSubjectType.SelectedItem).Id, ((PickerItem)pickerGroup.SelectedItem).Id, ((PickerItem)pickerStudent.SelectedItem).Id);
            Debug.WriteLine("((PickerItem)pickerSubject.SelectedItem).Id - " + ((PickerItem)pickerSubject.SelectedItem).Id);
            App.singleton.SendMessage(MessageEnum.statisticRequest, JsonConvert.SerializeObject(statisticRequest));
        }
    }
    public void SaveAsCSV()
    {
        string csvFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Personal), "statistic.csv");
        using (var stream = new FileStream(csvFilePath, FileMode.Create))
        {
            using (var writer = new StreamWriter(stream))
            {
                //string columnValues = string.Join(",", dataObject.Values);
                //writer.WriteLine(columnValues);
                writer.Close();
            }
        }
    }

    private void OnPickerDateSelectedIndexChanged(object sender, EventArgs e)
    {
        if (pickerDate.SelectedItem != null)
        {
            if (selectDate != (string)pickerDate.SelectedItem)
            {
                selectDate = (string)pickerDate.SelectedItem;
                RequestBefore();
            }
        }
    }
    private void OnPickerSubjectSelectedIndexChanged(object sender, EventArgs e)
    {
        if (pickerSubject.SelectedItem != null)
        {
            if(selectSubject != ((PickerItem)pickerSubject.SelectedItem).Name)
            {
                selectSubject = ((PickerItem)pickerSubject.SelectedItem).Name;
                Debug.WriteLine("selectSubject - " + selectSubject);
                RequestBefore();
            }
        }
    }
    private void OnPickerSubjectTypeSelectedIndexChanged(object sender, EventArgs e)
    {
        if (pickerSubjectType.SelectedItem != null)
        {
            if (selectSubjectType != ((PickerItem)pickerSubjectType.SelectedItem).Name)
            {
                selectSubjectType = ((PickerItem)pickerSubjectType.SelectedItem).Name;
                RequestBefore();
            }
        }
    }
    private void OnPickerGroupSelectedIndexChanged(object sender, EventArgs e)
    {
        if (pickerGroup.SelectedItem != null)
        {
            if (selectGroup != ((PickerItem)pickerGroup.SelectedItem).Name)
            {
                selectGroup = ((PickerItem)pickerGroup.SelectedItem).Name;
                RequestBefore();
            }
        }
    }
    private void OnPickerStudentSelectedIndexChanged(object sender, EventArgs e)
    {
        if (pickerStudent.SelectedItem != null)
        {
            if (selectStudent != ((PickerItem)pickerStudent.SelectedItem).Name)
            {
                selectStudent = ((PickerItem)pickerStudent.SelectedItem).Name;
                RequestBefore();
            }
        }
    }

    private void OnButtonRefreshClicked(object sender, EventArgs e)
    {
        RequestStatistic();
    }
}