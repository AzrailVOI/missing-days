using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Missing_days
{
    public enum MessageEnum
    {
        none = 0,
        message = 1,
        loginData = 2,
        userData = 3,
        weekRequest = 4,
        weekResponse = 5,
        publicKey = 6,
        secretKey = 7,
        checkData = 8,
        notify = 9,
        statisticRequest = 10,
        statisticResponse = 11,
        beforeStatisticRequest = 12,
        beforeStatisticResponse = 13,
    }
    public enum RoleEnum
    {
        student = 0,
        teacher = 1,
        moderator = 2,
        admin = 3,
    }
    public enum MissingEnum
    {
        none = 0,
        noRespect = 1,
        respect = 2,
        exist = 3,
    }
    public enum SubjectTypeEnum
    {
        none = 0,
        lecture = 1,
        practic = 2,
        laboratory = 3,
    }
    [JsonObject]
    public class BeforeStatisticRequest
    {
        public string sk;//session_key
        public DateOnly fd;//from_day
        public DateOnly td;//to_day
        public string su_id;//subjects_id
        public string sut_id;//subjects_type_id
        public string g_id;//groups_id
        public string st_id;//students_id

        public BeforeStatisticRequest(string sk, DateOnly fd, DateOnly td, string su_id = "", string sut_id = "", string g_id = "", string st_id = "")
        {
            this.sk = sk;
            this.fd = fd;
            this.td = td;
            this.su_id = su_id;
            this.sut_id = sut_id;
            this.g_id = g_id;
            this.st_id = st_id;
        }
    }
    [JsonObject]
    public class NameIndex
    {
        public string n;
        public string id;
    }
    [JsonObject]
    public class BeforeStatisticResponse
    {
        public List<NameIndex> su;//subjects/subjects_id
        public List<NameIndex> sut;//subjects_type/subjects_type_id
        public List<NameIndex> g;//groups/groups_id
        public List<NameIndex> st;//students/students_id
    }
    [JsonObject]
    public class StatisticRequest
    {
        public string sk;//session_key
        public DateOnly fd;//from_day
        public DateOnly td;//to_day
        public string su_id;//subjects_id
        public string sut_id;//subjects_type_id
        public string g_id;//groups_id
        public string st_id;//students_id

        public StatisticRequest(string session_key, DateOnly from_day, DateOnly to_day, string subject="", string subject_type = "", string group = "", string student = "")
        {
            this.sk = session_key;
            this.fd = from_day;
            this.td = to_day;
            this.g_id = group;
            this.su_id = subject;
            this.sut_id = subject_type;
            this.st_id = student;
        }
    }
    [JsonObject]
    public class StatisticDayData
    {
        public DateOnly d;//day
        public int m;//max
        public int r;//respect
        public int nr;//no_respect
        public int e;//exist
    }
    [JsonObject]
    public class StatisticResponse
    {
        public List<StatisticDayData> sd;//statistic_days
    }
    [JsonObject]
    public class CheckUserData
    {
        public string u;//user_id
        public int m;//missing
        public string r;//reason
    }
    [JsonObject]
    public class CheckData
    {
        public string sk;//session_key
        public string sc_id;//schedule_id
        public string su;//subject_name
        public List<CheckUserData> cu;//check_users
    }
    [JsonObject]
    public class UserInShedule
    {
        public string u;//user_id
        public string n;//name
        public string g;//group
        public int m;//missing
        public string r;//reason
    }
    [JsonObject]
    public class PairSchedule
    {
        public string sc_id;//schedule_id
        public int p;//pair_number
        public string r;//room_number
        public string su;//subject_name
        public string st;//subject_type
        public List<UserInShedule> us;//users
    }
    [JsonObject]
    public class DaySchedule
    {
        public List<PairSchedule> p;//pairs
        public DateOnly d;//day
    }
    [JsonObject]
    public class WeekResponse
    {
        public List<DaySchedule> sc;//schedules
    }
    [JsonObject]
    public class WeekRequest
    {
        public string session_key;
        public DateOnly day;

        public WeekRequest(string session_key, DateOnly day)
        {
            this.session_key = session_key;
            this.day = day;
        }
    }
    [JsonObject]
    public class UserData
    {
        public string login;
        public string first_name;
        public string middle_name;
        public string last_name;
        public int role_id;
        public string email;
        public string phone;
        public string session_key;
    }
    [JsonObject]
    public class LoginData
    {
        public string login;
        public string password;

        public LoginData(string login, string password)
        {
            this.login = login;
            this.password = password;
        }
    }
    public static class ProjectUtility
    {
        public static string GetRoleName(RoleEnum roleEnum)
        {
            switch (roleEnum)
            {
                case RoleEnum.student:
                    return "Студент";
                case RoleEnum.teacher:
                    return "Преподаватель";
                case RoleEnum.moderator:
                    return "Модератор";
            }
            return "Чёрт";
        }
    }
}
