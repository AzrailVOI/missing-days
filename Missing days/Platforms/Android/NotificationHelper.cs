using Android.App;
using Android.Content;
using Android.Content.Res;
using Android.Graphics;
using Android.OS;
using Android.Support.V4.App;
using AndroidX.Core.App;
using Missing_days;
using Color = Android.Graphics.Color;

namespace Missing_days.Platforms.Android
{

    public class NotificationHelper
    {
        public const int NotificationId = 0;

        public static void ShowNotification(Context context, string title, string message)
        {
            ShowNotification(context, title, message, BitmapFactory.DecodeResource(Resources.System, Resource.Drawable.avd_show_password));
        }
        public static void ShowNotification(Context context, string title, string message, Bitmap image)
        {
            // Создаем интент, который будет запускать наше приложение при нажатии на уведомление
            Intent intent = new Intent(context, typeof(MainActivity));
            intent.AddFlags(ActivityFlags.ClearTop);
            PendingIntent pendingIntent = PendingIntent.GetActivity(context, 0, intent, PendingIntentFlags.OneShot);

            // Создаем уведомление
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "default")
                .SetSmallIcon(Resource.Drawable.navigation_empty_icon)
                .SetLargeIcon(image)
                .SetColor(Color.Blue)
                .SetContentTitle(title)
                .SetContentText(message)
                .SetAutoCancel(true)
                .SetContentIntent(pendingIntent);

            // Отображаем уведомление
            NotificationManager notificationManager = (NotificationManager)context.GetSystemService(Context.NotificationService);
            notificationManager.Notify(NotificationId, builder.Build());
        }
    }
}