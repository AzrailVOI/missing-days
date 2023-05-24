
using System;
using Windows.Data.Xml.Dom;
using Windows.UI.Notifications;

namespace Missing_days.Platforms.Windows
{
    public static class NotificationHelper
    {
        public static void ShowToastNotification(string title, string message)
        {
            var toastXml = ToastNotificationManager.GetTemplateContent(ToastTemplateType.ToastText02);
            var toastTextElements = toastXml.GetElementsByTagName("text");
            toastTextElements[0].AppendChild(toastXml.CreateTextNode(title));
            toastTextElements[1].AppendChild(toastXml.CreateTextNode(message));

            var toast = new ToastNotification(toastXml);
            ToastNotificationManager.CreateToastNotifier().Show(toast);
        }
    }
}
