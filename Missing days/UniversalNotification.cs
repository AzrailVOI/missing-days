using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Maui.Devices;

namespace Missing_days
{
    static class UniversalNotification
    {
        public interface INotificationManager
        {
            event EventHandler NotificationReceived;
            void Initialize();
            void SendNotification(string title, string message, DateTime? notifyTime = null);
            void ReceiveNotification(string title, string message);
        }
        public class NotificationEventArgs : EventArgs
        {
            public string Title { get; set; }
            public string Message { get; set; }
        }
        static void ShowNotification( string title, string message)
        {
#if ANDROID
                //Missing_days.Platforms.Android.NotificationHelper.ShowNotification(this,title, message);
#endif
#if WINDOWS
            Missing_days.Platforms.Windows.NotificationHelper.ShowToastNotification(title, message);
#endif
        }
    }
}
