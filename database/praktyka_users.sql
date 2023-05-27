-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: praktyka
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `login` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role_id` int NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idusers_UNIQUE` (`user_id`),
  UNIQUE KEY `login_UNIQUE` (`login`),
  UNIQUE KEY `password_hash_UNIQUE` (`password_hash`),
  KEY `fk_users_roles_idx` (`role_id`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'-','-','-','-','-','-','3973e022e93220f9212c18d0d0c543ae7c309e46640da93a4a0314de999f5112',1,'-'),(2,'Владыслав','Иллич','Овчарук','ggtname@gmail.com','+380687794188','Wlad','03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',0,NULL),(3,'Георгий','Александрович','Ерёмкин','vladovcharyk@gmail.com','+79614033169','Georg','fe2592b42a727e977f055947385b709cc82b16b9a87f88c6abf3900d65d0cdc3',0,NULL),(4,'Сергей','Михайлович','Щербаков','vladovcarukat@gmail.com','+79118492239','Sherb','20f3765880a5c269b747e1e906054a4b4a3a991259f1e16b5dde4742cec2319a',1,'Доц.'),(5,'Г','В','Лукьянова','hiram55115@duscore.com','+79666666666','Demon','91db069dc0d8a76d4974f5bd286ea7b4d96bef57095827e23594a060f469acef',1,'Ст. преп.'),(6,'С','В','Филатов','hiram55115@duscore.com','+79000000000','Hist','0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c',1,'Доц.'),(7,'Е','С','Ионова','hiram55115@duscore.com','+79333333333','Andl','4aec429ac0bfafdbb8dab14f41d1b7a98dacf1ce3478b71b904d383ae614b032',1,'Ст. преп'),(8,'Михаил','Александрович','Кривошеев','hiram55115@duscore.com','+79999999999','Krsh','dfdb05a4803e3ffefdd25984719bc7ed48b92b65b297bdc3c766e98731b71ba2',0,NULL),(9,'Т','А','Шкодина','hiram55115@duscore.com','+79111111111','Shod','eaf89db7108470dc3f6b23ea90618264b3e8f8b6145371667c4055e9c5ce9f52',1,'Ст. преп.'),(10,'Л','М','Фрид','hiram55115@duscore.com','+79333333333','Frid','f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae',1,'Доц.'),(11,'С','С','Дегтярёв','hiram55115@duscore.com','+7992882288','Ass','c75cb66ae28d8ebc6eded002c28a8ba0d06d3a78c6b5cbf9b2ade051f0775ac4',1,'Асс.'),(12,'А','М','Прохорова','hiram55115@duscore.com','+7999999955','Proch','91a73fd806ab2c005c13b4dc19130a884e909dea3f72d46e30266fe1a1f588d8',1,'Ст. преп'),(13,'И','В','Ганичев','hiram55115@duscore.com','+7666666655','Chert','1a7648bc484b3d9ed9e2226d223a6193d64e5e1fcacd97868adec665fe12b924',1,'Доц.'),(14,'Т','А','Жаброва','hiram55115@duscore.com','+7555555555','Zhabre','a320480f534776bddb5cdb54b1e93d210a3c7d199e80a23c1b2178497b184c76',1,'Доц.'),(15,'С','А','Глушенко','hiram55115@duscore.com','+7999551112','Glush','6161b2838ffa6ce17b84db3b45b4f8437855ecf43e75de2d1ad0008eaae91aa0',1,'Доц.'),(16,'Э','В','Мануйленко','hiram55115@duscore.com','+79988885588','Ev','bcf1b6a7a986e20e0ff021f9127b89b84d3ac8b62de745a59cf905afffe36997',1,'Доц.'),(17,'Ибрагим','Алиханович','Абубакаров','hiram55115@duscore.com','+79885556644','Ab','d87c339e9dd87f482db1ddeb0ad25f11820e1c2ab742c541999e9dbaba677365',0,NULL),(18,'Анна','Борисовна','Боборикина','hiram55115@duscore.com','+79566874188','BobAnn','1b88a93113daa9a8d551b4def4f03eced42fa1e0a96b595d3ea7885df1e6b65b',0,NULL),(19,'Владислав','Павлович','Волчанский','hiram55115@duscore.com','+79865412323','Volk','8dbd62498c41b3d712bd4e1625882a22c133a298019166bca14e845391547f95',0,NULL),(20,'Полина','Валерьевна','Данилова','hiram55115@duscore.com','+79654123655','PolDan','c5bff5e9cee82e70555f81150674bac2942415f22067b977468f4422bc862d50',0,NULL),(21,'Елена','Михайловна','Клышникова','hiram55115@duscore.com','+79856412233','Klysh','431d61fd078994e3b41e1719cf9aa2259d1032e6af4b8efdb9f2a5e5c03c421d',0,NULL),(22,'Максим','Станиславович','Ковалёв','hiram55115@duscore.com','+78956543322','Koval','5131f30a81e92f0b5ba447e131543c95de75c7599de2899f3cbd1dd6399577fc',0,NULL),(23,'Алисбек Джамшит','Угли','Мансуров','hiram55115@duscore.com','+79845463215','Uhli','03712a7fbf3832e75c00f0d9785dc95b162ce589606bdfa5ce41d81a22c7decc',0,NULL),(24,'Нина','Вячеславовна','Матвєєвна','hiram55115@duscore.com','+380687415522','Nina','79f06f8fde333461739f220090a23cb2a79f6d714bee100d0e4b4af249294619',0,NULL),(25,'Александр','Романович','Мельников','hiram55115@duscore.com','+79651233212','Melna','e11d8cb94b54e0a2fd0e780f93dd51837fd39bf0c9b86f21e760d02a8550ddf7',0,NULL),(26,'Роман','Александрович','Поплавский','hiram55115@duscore.com','+79856654123','Poplav','69f7f7a7f8bca9970fa6f9c0b8dad06901d3ef23fd599d3213aa5eee5621c3e3',0,NULL),(27,'Бесмелла',' ','Юсофи','hiram55115@duscore.com','+79654123564','Yusov','1f8b6d5a89242a0984816601b1a527ed239e16e213182481301d2706f4396703',0,NULL),(28,'Обайдулла',' ','Сабавун','hiram55115@duscore.com','+79654123456','Sab','b3c4b40750a97212e8981e4ac494d1ec77053f1eaf4e0934c276b74fc4f87c48',0,NULL),(29,'Жора','Арташесович','Абгарян','hiram55115@duscore.com','+79876544568','Abgar','bb0f6a26de562e481bcbfcc0380fe6ddc7f6bcb2a2fa5cda912087863efef205',0,NULL),(30,'Самир',' ','Белмаррауи','hiram55115@duscore.com','+74561237896','Belm','f12a38838db97f7767c61d3922fa073656e407f00d8dc7337e5b5d0b009221da',0,NULL),(31,'Михаил',' ','Михин','hiram55115@duscore.com','+79654123587','Mihin','fa5689e1b0ed8298227a9807c7fe00d3715d8e368851612aa267846c65898d97',0,NULL),(32,'Олег',' ','Хатчёнок','hiram55115@duscore.com','+79658974815','Chatc','0fc09571fbb4157ce5ea44c97db3bdb737d20f379c5218322c7447735655f88d',0,NULL),(33,'Есения','Радионовна','Левицкая','hiram55115@duscore.com','+78524125555','Levic','2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef',0,NULL),(34,'Ярослав','Юрьевич','Вольников','hiram55115@duscore.com','+79654513546','Volnik','9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0',0,NULL),(35,'Светлана','Алексеевна','Громова','hiram55115@duscore.com','+79654864564','Svet','e7042ac7d09c7bc41c8cfa5749e41858f6980643bc0db1a83cc793d3e24d3f77',0,NULL),(36,'Дарья','Константиновна','Квасова','hiram55115@duscore.com','+79554564546','Kvas','91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203',0,NULL),(37,'Татьяна','Васильевна','Колошинская','hiram55115@duscore.com','+79865412369','Kolosh','20fdf64da3cd2c78ec3c033d2ac628bacf701711fa99435ee37bef0304800dc5',0,NULL),(38,'Кирилл','Олегович','Коробейников','hiram55115@duscore.com','+79898989898','Korob','556d7dc3a115356350f1f9910b1af1ab0e312d4b3e4fc788d2da63668f36d017',0,NULL),(39,'Дмитрий','Викторович','Михайличенко','hiram55115@duscore.com','+79856541236','Michako','318aee3fed8c9d040d35a7fc1fa776fb31303833aa2de885354ddf3d44d8fb69',0,NULL),(40,'Дмитрий','Станиславович','Мырша','hiram55115@duscore.com','+79655689798','Myrsha','216e683ff0d2d25165b8bb7ba608c9a628ef299924ca49ab981ec7d2fecd6dad',0,NULL),(41,'Владислав','Михайлович','Павлов','hiram55115@duscore.com','+79654564655','Pavlvl','68487dc295052aa79c530e283ce698b8c6bb1b42ff0944252e1910dbecdc5425',0,NULL),(42,'Нина','Евгеньевна','Петрова','hiram55115@duscore.com','+79655698745','Petrn','f05cf0e1b0f53e4962118589d0dea67fcc461280dc7f1fbdc297ba2ec3d1070a',0,NULL),(43,'Олеся','Сергеевна','Троцкая','hiram55115@duscore.com','+79965565464','Troc','afb47e00531153e93808589e43d02c11f6398c5bc877f7924cebca8211c8dd18',0,NULL),(44,'Дмитрий','Андреевич','Труфакин','hiram55115@duscore.com','+79655698545','Truf','6d350a2155acf0c0cd7dcbaab0c9587520a59e5da467948d0a568f4a61c0f7a0',0,NULL),(45,'Егор','Анатольевич','Тряпицын','hiram55115@duscore.com','+79865412369','Trap','785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09',0,NULL),(46,'Никита','Сергеевич','Шабунин','hiram55115@duscore.com','+79654123698','Shab','9b871512327c09ce91dd649b3f96a63b7408ef267c8cc5710114e629730cb61f',0,NULL),(47,'Александр','Владимирович','Ивахник','hiram55115@duscore.com','+79654123698','Ivach','edee29f882543b956620b26d0ee0e7e950399b1c4222f5de05e06425b4c995e9',0,NULL),(48,'Дени','Хусейнович','Курбанов','hiram55115@duscore.com','+79633333333','Kurb','cc399d73903f06ee694032ab0538f05634ff7e1ce5e8e50ac330a871484f34cf',0,NULL),(49,'Александр','Сергеевич','Левичев','hiram55115@duscore.com','+79656987412','Levich','4cc8f4d609b717356701c57a03e737e5ac8fe885da8c7163d3de47e01849c635',0,NULL),(50,'Максим','Андреевич','Петренко','hiram55115@duscore.com','+79654123698','Petrko','cc2e018aa6eb9612ccd027bbdcdc9b8c8d351789f14cae4d688a876c18938235',0,NULL),(51,'Ю','Г','Декамили','hiram55115@duscore.com','+79856544569','Dek','4c5d562c16e052c0b0991afa0d7f3023a8e5a103d0e184c15b9092dd0cce2264',1,'Ст. преп.'),(52,'Бог','Богович','Тищенко','t@email.com','+79555555555','Boh','888b19a43b151683c87895f6211d9f8640f97bdc8ef32f03dbe057c8f5e56d32',2,'Модератор');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-27 10:33:48
