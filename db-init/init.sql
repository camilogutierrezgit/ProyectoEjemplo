CREATE DATABASE IF NOT EXISTS `app_db`;
USE `app_db`;

CREATE TABLE IF NOT EXISTS `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `FirstName` longtext CHARACTER SET utf8mb4 NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 NOT NULL,
  `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
  `Role` int NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `AvatarUrl` longtext CHARACTER SET utf8mb4 NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Users` (`Id`, `FirstName`, `LastName`, `Email`, `Role`, `IsActive`, `AvatarUrl`) VALUES
(1, 'Ada', 'Lovelace', 'ada@example.com', 0, 1, 'https://i.pravatar.cc/150?u=ada'),
(2, 'Alan', 'Turing', 'alan@example.com', 1, 1, 'https://i.pravatar.cc/150?u=alan'),
(3, 'Grace', 'Hopper', 'grace@example.com', 0, 0, 'https://i.pravatar.cc/150?u=grace');
