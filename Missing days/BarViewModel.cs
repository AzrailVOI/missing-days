
using CommunityToolkit.Mvvm.ComponentModel;
using LiveChartsCore;
using LiveChartsCore.Kernel.Sketches;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using SkiaSharp;


namespace Missing_days;
public partial class BarViewModel : ObservableObject
{
    public List<List<int>> listList = new List<List<int>>() {
        new List<int>() { 10, 10, 10, 10, 10, 10, 10 },
        new List<int>() { 3, 10, 5, 3, 7, 3, 8 },
        new List<int>() { 2, 9, 4, 2, 5, 2, 7 },
        new List<int>() { 1, 4, 3, 1, 4, 2, 4 }
    };
    public ISeries[] Series { get; set; } =
    {
        new ColumnSeries<int>
        {
            Name = "Максимальное количество посещений",
            IsHoverable = false, // disables the series from the tooltips 
            //le = new string[] { "Name 1", "Name 2", "Name 3", "Name 4", "Name 5", "Name 6", "Name 7" }
            Values = new int[] { 10, 10, 10, 10, 10, 10, 10 },
            Stroke = null,
            Fill = new SolidColorPaint(new SKColor(30, 30, 30, 30)),
            IgnoresBarPosition = true
        },
        new ColumnSeries<int>
        {
            Name = "Пропусков без уважительной",
            Values = new int[] { 3, 10, 5, 3, 7, 3, 8 },
            Stroke = null,
            Fill = new SolidColorPaint(SKColors.Red),
            IgnoresBarPosition = true
        },
        new ColumnSeries<int>
        {
            Name = "Пропусков по уважительной",
            Values = new int[] { 3, 10, 5, 3, 7, 3, 8 },
            Stroke = null,
            Fill = new SolidColorPaint(SKColors.Yellow),
            IgnoresBarPosition = true
        },
        new ColumnSeries<int>
        {
            Name = "Посещений",
            Values = new int[] { 3, 10, 5, 3, 7, 3, 8 },
            Stroke = null,
            Fill = new SolidColorPaint(SKColors.Green),
            IgnoresBarPosition = true
        }
    };

    public Axis[] YAxes { get; set; } =
    {
        new Axis {
            //MinLimit = 0,
            //MaxLimit = 10,
            MinStep = 1 }
    };
    public Axis[] XAxes { get; set; } =
    {
        new Axis { 
            //MinLimit = 0,
            //MaxLimit = 10,
            MinStep = 1
        }
    };
    public void UpdateValues()
    {
        for (int i = 0; i < Series.Length; i++)
        {
            Series[i].Values = listList[i];
        }
    }
}
