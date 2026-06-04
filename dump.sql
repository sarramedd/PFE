-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 28 avr. 2026 à 14:11
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestionprojet`
--

-- --------------------------------------------------------

--
-- Structure de la table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint(20) NOT NULL,
  `task_id` bigint(20) DEFAULT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `attachments`
--

INSERT INTO `attachments` (`id`, `task_id`, `uploaded_at`, `file_name`, `file_path`, `project_id`) VALUES
(1, 4, '2026-03-30 18:14:26.000000', 'Sarra Meddah (1).pdf', '/uploads/task-attachments/7bbb9230-c350-4d0e-a93f-ff8a20837c7a_Sarra_Meddah__1_.pdf', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `entity_id` bigint(20) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `performed_by` bigint(20) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `entity_type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `audit_logs`
--

INSERT INTO `audit_logs` (`entity_id`, `id`, `performed_by`, `timestamp`, `action`, `entity_type`) VALUES
(1, 1, 3, '2026-03-30 18:14:26.000000', 'ATTACHMENT_UPLOADED', 'TASK_ATTACHMENT'),
(5, 2, 3, '2026-03-30 18:16:03.000000', 'COMMENT_CREATED', 'TASK_COMMENT'),
(5, 3, 3, '2026-03-30 21:32:25.000000', 'TASK_CREATED', 'TASK'),
(3, 4, 3, '2026-04-10 15:30:33.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(3, 5, 3, '2026-04-10 15:30:34.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(3, 6, 3, '2026-04-10 15:30:35.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(1, 7, 3, '2026-04-10 15:30:59.000000', 'TASK_UPDATED', 'TASK'),
(4, 8, 3, '2026-04-10 15:31:12.000000', 'TASK_UPDATED', 'TASK'),
(6, 9, 3, '2026-04-10 15:33:35.000000', 'TASK_CREATED', 'TASK'),
(6, 10, 3, '2026-04-10 15:34:19.000000', 'TASK_DELETED', 'TASK'),
(7, 11, 3, '2026-04-10 16:10:49.000000', 'TASK_CREATED', 'TASK'),
(6, 12, 5, '2026-04-10 16:12:09.000000', 'COMMENT_CREATED', 'TASK_COMMENT'),
(7, 13, 5, '2026-04-10 16:12:17.000000', 'COMMENT_CREATED', 'TASK_COMMENT'),
(8, 14, 3, '2026-04-24 14:24:18.000000', 'COMMENT_CREATED', 'TASK_COMMENT'),
(1, 15, 3, '2026-04-27 12:03:47.000000', 'TASK_TIMER_STOPPED', 'TASK_WORKLOG'),
(3, 16, 4, '2026-04-27 12:05:46.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(1, 17, 4, '2026-04-27 12:06:04.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(1, 18, 4, '2026-04-27 12:06:29.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(2, 19, 3, '2026-04-27 13:33:43.000000', 'TASK_TIMER_STOPPED', 'TASK_WORKLOG'),
(2, 20, 7, '2026-04-27 14:09:56.000000', 'PROJECT_CREATED', 'PROJECT'),
(8, 21, 7, '2026-04-27 14:10:39.000000', 'TASK_CREATED', 'TASK'),
(8, 22, 7, '2026-04-27 14:10:48.000000', 'TASK_UPDATED', 'TASK'),
(1, 23, 9, '2026-04-27 14:17:20.000000', 'MILESTONE_CREATED', 'MILESTONE'),
(1, 24, 9, '2026-04-27 14:17:36.000000', 'AUTOMATION_RULE_CREATED', 'AUTOMATION_RULE'),
(1, 25, 9, '2026-04-27 14:18:33.000000', 'AUTOMATION_RULE_TOGGLED', 'AUTOMATION_RULE'),
(1, 26, 9, '2026-04-27 14:18:34.000000', 'AUTOMATION_RULE_TOGGLED', 'AUTOMATION_RULE'),
(1, 27, 9, '2026-04-27 14:22:07.000000', 'AUTOMATION_RULE_TOGGLED', 'AUTOMATION_RULE'),
(2, 28, 9, '2026-04-27 14:22:20.000000', 'AUTOMATION_RULE_CREATED', 'AUTOMATION_RULE'),
(1, 29, 3, '2026-04-27 14:22:57.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(7, 30, 3, '2026-04-27 14:22:59.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(4, 31, 3, '2026-04-27 14:23:06.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(1, 32, 3, '2026-04-27 14:23:20.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(1, 33, 4, '2026-04-27 14:24:02.000000', 'TASK_STATUS_CHANGED', 'TASK'),
(3, 34, 8, '2026-04-27 19:12:59.000000', 'TASK_TIMER_STOPPED', 'TASK_WORKLOG'),
(8, 35, 8, '2026-04-27 19:14:00.000000', 'TASK_STATUS_CHANGED', 'TASK');

-- --------------------------------------------------------

--
-- Structure de la table `automation_rules`
--

CREATE TABLE `automation_rules` (
  `id` bigint(20) NOT NULL,
  `action_type` enum('CREATE_FOLLOWUP_TASK','NOTIFY_PROJECT_MANAGER') DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `enabled` bit(1) NOT NULL,
  `follow_up_delay_days` int(11) DEFAULT NULL,
  `follow_up_title_template` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `trigger_status` enum('DONE','IN_PROGRESS','TODO') DEFAULT NULL,
  `organization_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `automation_rules`
--

INSERT INTO `automation_rules` (`id`, `action_type`, `created_at`, `enabled`, `follow_up_delay_days`, `follow_up_title_template`, `name`, `trigger_status`, `organization_id`) VALUES
(1, 'NOTIFY_PROJECT_MANAGER', '2026-04-27 14:17:36.000000', b'0', 3, '', 'fist', 'TODO', 2),
(2, 'NOTIFY_PROJECT_MANAGER', '2026-04-27 14:22:20.000000', b'1', 3, '', '2hg', 'DONE', 2);

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE `comments` (
  `author_id` bigint(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `task_id` bigint(20) DEFAULT NULL,
  `content` varchar(2000) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`author_id`, `created_at`, `id`, `task_id`, `content`, `project_id`) VALUES
(NULL, '2026-03-30 11:41:01.000000', 1, NULL, 'hi', NULL),
(3, '2026-03-30 11:41:35.000000', 2, NULL, 'salut', 1),
(4, '2026-03-30 16:03:58.000000', 3, NULL, 'salut sara3', 1),
(3, '2026-03-30 18:12:04.000000', 4, 4, 'en cours', 1),
(3, '2026-03-30 18:16:03.000000', 5, 4, 'tache', 1),
(5, '2026-04-10 16:12:09.000000', 6, 7, 'en cours', 1),
(5, '2026-04-10 16:12:17.000000', 7, 7, 'dd', 1),
(3, '2026-04-24 14:24:18.000000', 8, NULL, 'l', 1);

-- --------------------------------------------------------

--
-- Structure de la table `comment_reactions`
--

CREATE TABLE `comment_reactions` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `reaction_type` enum('CLAP','LIKE','LOVE','ROCKET','THANKS') DEFAULT NULL,
  `comment_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `milestones`
--

CREATE TABLE `milestones` (
  `id` bigint(20) NOT NULL,
  `completed` bit(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `project_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `milestones`
--

INSERT INTO `milestones` (`id`, `completed`, `created_at`, `description`, `due_date`, `title`, `project_id`) VALUES
(1, b'0', '2026-04-27 14:17:20.000000', 'j1', '2026-04-27', 'jalon 1', 1);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `is_read` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `type` enum('AUTOMATION','COMMENT_MENTION','DAILY_DIGEST','DUE_REMINDER','GENERAL','OVERLOAD_ALERT','TASK_UPDATE') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`is_read`, `created_at`, `id`, `user_id`, `message`, `read_at`, `type`) VALUES
(b'1', '2026-03-30 16:01:55.000000', 1, 4, 'You have been added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:03:58.000000', 2, 3, 'New message from moetaz dogmane in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 16:26:58.000000', 3, 4, 'A new task \"diagramme de classe\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:26:58.000000', 4, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:27:25.000000', 5, 4, 'A new task \"tache 2\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:27:25.000000', 6, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:36:57.000000', 7, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 16:36:57.000000', 8, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:37:21.000000', 9, 3, 'Task \"tache 2\" status changed to TODO.', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 16:37:21.000000', 10, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:38:18.000000', 11, 3, 'A new task \"tache 3\" was added to project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 16:38:18.000000', 12, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 16:39:15.000000', 13, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 16:39:16.000000', 14, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 17:24:05.000000', 15, 3, 'Task \"tache 2\" status changed to TODO.', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 17:24:05.000000', 16, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 17:43:04.000000', 17, 4, 'A new task \"surveiller\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 17:43:04.000000', 18, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 18:11:08.000000', 19, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-03-30 18:11:08.000000', 20, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 18:12:04.000000', 21, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 18:16:03.000000', 22, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 21:32:25.000000', 23, 4, 'A new task \"preparer template\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-03-30 21:32:25.000000', 24, 3, 'You have been assigned to task \"preparer template\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-04-10 15:30:33.000000', 25, 4, 'Task \"tache 3\" status changed to IN_PROGRESS.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:33.000000', 26, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:34.000000', 27, 4, 'Task \"tache 3\" status changed to DONE.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:34.000000', 28, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:35.000000', 29, 4, 'Task \"tache 3\" status changed to TODO.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:35.000000', 30, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:59.000000', 31, 4, 'Task \"diagramme de classe\" was updated.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:30:59.000000', 32, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:31:12.000000', 33, 4, 'Task \"surveiller\" was updated.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:31:12.000000', 34, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-04-10 15:31:56.000000', 35, 5, 'You have been added to project \"website\".', NULL, NULL),
(b'1', '2026-04-10 15:33:35.000000', 36, 4, 'A new task \"base de donnees\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:33:35.000000', 37, 5, 'A new task \"base de donnees\" was added to project \"website\".', NULL, NULL),
(b'1', '2026-04-10 15:33:36.000000', 38, 5, 'You have been assigned to task \"base de donnees\".', NULL, NULL),
(b'1', '2026-04-10 15:34:19.000000', 39, 4, 'Task \"base de donnees\" was deleted.', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 15:34:19.000000', 40, 5, 'Task \"base de donnees\" was deleted.', NULL, NULL),
(b'1', '2026-04-10 15:34:19.000000', 41, 5, 'You have been assigned to task \"base de donnees\".', NULL, NULL),
(b'1', '2026-04-10 16:10:49.000000', 42, 4, 'A new task \"bdd\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 16:10:49.000000', 43, 5, 'A new task \"bdd\" was added to project \"website\".', NULL, NULL),
(b'1', '2026-04-10 16:10:49.000000', 44, 5, 'You have been assigned to task \"bdd\".', NULL, NULL),
(b'1', '2026-04-10 16:12:09.000000', 45, 3, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-04-10 16:12:09.000000', 46, 4, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-10 16:12:17.000000', 47, 3, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(b'1', '2026-04-10 16:12:17.000000', 48, 4, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(b'1', '2026-04-24 14:24:18.000000', 49, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'0', '2026-04-24 14:24:18.000000', 50, 5, 'New message from sarra meddah in project \"website\".', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 12:05:46.000000', 51, 3, 'Task \"tache 3\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 12:05:46.000000', 52, 5, 'Task \"tache 3\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 12:05:46.000000', 53, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 12:06:04.000000', 54, 3, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 12:06:04.000000', 55, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 12:06:04.000000', 56, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 12:06:29.000000', 57, 3, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 12:06:29.000000', 58, 5, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 12:06:29.000000', 59, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:10:39.000000', 60, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:12:35.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:10:48.000000', 61, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:12:35.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:22:57.000000', 62, 3, 'Automation: task \"diagramme de classe\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(b'1', '2026-04-27 14:22:57.000000', 63, 4, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 14:22:57.000000', 64, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 14:22:57.000000', 65, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:22:59.000000', 66, 3, 'Automation: task \"bdd\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(b'1', '2026-04-27 14:22:59.000000', 67, 4, 'Task \"bdd\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 14:22:59.000000', 68, 5, 'Task \"bdd\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'0', '2026-04-27 14:22:59.000000', 69, 5, 'You have been assigned to task \"bdd\".', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 14:23:06.000000', 70, 3, 'Automation: task \"surveiller\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(b'1', '2026-04-27 14:23:06.000000', 71, 4, 'Task \"surveiller\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 14:23:06.000000', 72, 5, 'Task \"surveiller\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 14:23:06.000000', 73, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:23:20.000000', 74, 4, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 14:23:20.000000', 75, 5, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 14:23:20.000000', 76, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 14:24:02.000000', 77, 3, 'Automation: task \"diagramme de classe\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(b'1', '2026-04-27 14:24:02.000000', 78, 3, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(b'0', '2026-04-27 14:24:02.000000', 79, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(b'1', '2026-04-27 14:24:02.000000', 80, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 19:13:33.000000', 81, 8, 'You have been added to project \"code\".', '2026-04-27 19:13:48.000000', 'GENERAL'),
(b'1', '2026-04-27 19:14:00.000000', 82, 7, 'Task \"laklak\" status changed to IN_PROGRESS.', '2026-04-27 19:14:54.000000', 'TASK_UPDATE'),
(b'1', '2026-04-27 19:14:00.000000', 83, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:14:29.000000', 'TASK_UPDATE');

-- --------------------------------------------------------

--
-- Structure de la table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` bigint(20) NOT NULL,
  `automation_enabled` bit(1) NOT NULL,
  `daily_digest_enabled` bit(1) NOT NULL,
  `due_reminder_enabled` bit(1) NOT NULL,
  `email_enabled` bit(1) NOT NULL,
  `in_app_enabled` bit(1) NOT NULL,
  `overload_alert_enabled` bit(1) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification_preferences`
--

INSERT INTO `notification_preferences` (`id`, `automation_enabled`, `daily_digest_enabled`, `due_reminder_enabled`, `email_enabled`, `in_app_enabled`, `overload_alert_enabled`, `user_id`) VALUES
(1, b'1', b'1', b'1', b'0', b'1', b'1', 4),
(2, b'1', b'1', b'1', b'0', b'1', b'1', 5),
(3, b'1', b'1', b'1', b'0', b'1', b'1', 3),
(4, b'1', b'1', b'1', b'1', b'1', b'1', 1),
(5, b'1', b'1', b'1', b'0', b'1', b'1', 8),
(6, b'1', b'1', b'1', b'1', b'1', b'1', 9),
(7, b'1', b'1', b'1', b'0', b'1', b'1', 7);

-- --------------------------------------------------------

--
-- Structure de la table `organizations`
--

CREATE TABLE `organizations` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint(20) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `organizations`
--

INSERT INTO `organizations` (`created_at`, `id`, `description`, `name`, `logo_url`) VALUES
('2026-03-25 15:57:51.000000', 1, 'Technical organization for global administration', 'SYSTEM', NULL),
('2026-03-25 16:04:06.000000', 2, 'RFC', 'RFC', '/uploads/organizations/4ed4d725-7d38-4cdb-993d-cc0a4f0a9d42.png'),
('2026-03-26 22:33:11.000000', 3, 'zaineb ben mesaoud', 'zaineb', '/uploads/organizations/e67965a6-84fc-41ad-b6af-1e8a54b9c719.png'),
('2026-04-14 13:08:01.000000', 4, '/', 'Google', '/uploads/organizations/0b491bb5-4710-4735-8a92-632c542812ea.png');

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `end_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `organization_id` bigint(20) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','ARCHIVED','COMPLETED') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `projects`
--

INSERT INTO `projects` (`end_date`, `start_date`, `created_at`, `id`, `organization_id`, `description`, `name`, `status`) VALUES
('2027-06-22', '2026-03-30', '2026-03-30 11:26:25.000000', 1, 2, 'dev dans e commerce', 'website', 'ACTIVE'),
('2026-06-24', '2026-04-29', '2026-04-27 14:09:56.000000', 2, 4, 'lkjhy', 'code', 'ACTIVE');

-- --------------------------------------------------------

--
-- Structure de la table `project_members`
--

CREATE TABLE `project_members` (
  `id` bigint(20) NOT NULL,
  `joined_at` datetime(6) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `role_in_project` enum('ADMIN','MEMBER') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `project_members`
--

INSERT INTO `project_members` (`id`, `joined_at`, `project_id`, `user_id`, `role_in_project`) VALUES
(1, '2026-03-30 11:26:25.000000', 1, 3, 'ADMIN'),
(2, '2026-03-30 16:01:55.000000', 1, 4, 'MEMBER'),
(3, '2026-04-10 15:31:56.000000', 1, 5, 'MEMBER'),
(4, '2026-04-27 14:09:56.000000', 2, 7, 'ADMIN'),
(5, '2026-04-27 19:13:33.000000', 2, 8, 'MEMBER');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `due_date` date DEFAULT NULL,
  `assigned_to` bigint(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `parent_task_id` bigint(20) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `priority` enum('HIGH','LOW','MEDIUM') DEFAULT NULL,
  `status` enum('DONE','IN_PROGRESS','TODO') DEFAULT NULL,
  `estimated_hours` int(11) DEFAULT NULL,
  `depends_on_task_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`due_date`, `assigned_to`, `created_at`, `id`, `parent_task_id`, `project_id`, `description`, `title`, `priority`, `status`, `estimated_hours`, `depends_on_task_id`) VALUES
('2026-04-23', 4, '2026-03-30 16:26:57.000000', 1, NULL, 1, 'testttttt', 'diagramme de classe', NULL, 'DONE', NULL, NULL),
('2026-03-30', 4, '2026-03-30 16:27:25.000000', 2, NULL, 1, 'tache 222222', 'tache 2', NULL, 'DONE', NULL, NULL),
('2026-04-10', 4, '2026-03-30 16:38:18.000000', 3, NULL, 1, 'tache 3', 'tache 3', NULL, 'DONE', NULL, NULL),
('2026-04-13', 3, '2026-03-30 17:43:04.000000', 4, NULL, 1, 'valider les taches', 'surveiller', NULL, 'DONE', NULL, NULL),
('2026-03-31', 3, '2026-03-30 21:32:25.000000', 5, 1, 1, 'telecharger template back et front', 'preparer template', NULL, 'DONE', 12, 1),
('2026-04-30', 5, '2026-04-10 16:10:49.000000', 7, 1, 1, 'preparation bdd', 'bdd', NULL, 'DONE', 7, 1),
('2026-04-30', 8, '2026-04-27 14:10:39.000000', 8, NULL, 2, 'laklak', 'laklak', NULL, 'IN_PROGRESS', 3, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `task_history`
--

CREATE TABLE `task_history` (
  `id` bigint(20) NOT NULL,
  `change_type` enum('CREATED','DELETED','STATUS_CHANGED','UPDATED') DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `new_value` varchar(500) DEFAULT NULL,
  `previous_value` varchar(500) DEFAULT NULL,
  `changed_by` bigint(20) DEFAULT NULL,
  `task_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_history`
--

INSERT INTO `task_history` (`id`, `change_type`, `created_at`, `new_value`, `previous_value`, `changed_by`, `task_id`) VALUES
(1, 'STATUS_CHANGED', '2026-04-27 12:05:46.000000', 'DONE', 'TODO', 4, 3),
(2, 'STATUS_CHANGED', '2026-04-27 12:06:04.000000', 'DONE', 'TODO', 4, 1),
(3, 'STATUS_CHANGED', '2026-04-27 12:06:29.000000', 'IN_PROGRESS', 'DONE', 4, 1),
(4, 'CREATED', '2026-04-27 14:10:39.000000', 'Task created with status TODO', NULL, 7, 8),
(5, 'UPDATED', '2026-04-27 14:10:48.000000', 'TODO', 'TODO', 7, 8),
(6, 'STATUS_CHANGED', '2026-04-27 14:22:57.000000', 'DONE', 'IN_PROGRESS', 3, 1),
(7, 'STATUS_CHANGED', '2026-04-27 14:22:59.000000', 'DONE', 'TODO', 3, 7),
(8, 'STATUS_CHANGED', '2026-04-27 14:23:06.000000', 'DONE', 'TODO', 3, 4),
(9, 'STATUS_CHANGED', '2026-04-27 14:23:20.000000', 'IN_PROGRESS', 'DONE', 3, 1),
(10, 'STATUS_CHANGED', '2026-04-27 14:24:02.000000', 'DONE', 'IN_PROGRESS', 4, 1),
(11, 'STATUS_CHANGED', '2026-04-27 19:14:00.000000', 'IN_PROGRESS', 'TODO', 8, 8);

-- --------------------------------------------------------

--
-- Structure de la table `task_worklogs`
--

CREATE TABLE `task_worklogs` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `minutes_spent` int(11) DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `work_date` date DEFAULT NULL,
  `task_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `task_worklogs`
--

INSERT INTO `task_worklogs` (`id`, `created_at`, `minutes_spent`, `notes`, `work_date`, `task_id`, `user_id`) VALUES
(1, '2026-04-27 12:03:47.000000', 1, '', '2026-04-27', 4, 3),
(2, '2026-04-27 13:33:43.000000', 1, '', '2026-04-27', 4, 3),
(3, '2026-04-27 19:12:59.000000', 1, '', '2026-04-27', 8, 8);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `is_active` bit(1) DEFAULT NULL,
  `cin` bigint(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint(20) NOT NULL,
  `organization_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','MEMBER','ORGANIZATION_ADMIN','PROJECT_MANAGER','SUPER_ADMIN') DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`is_active`, `cin`, `created_at`, `id`, `organization_id`, `email`, `first_name`, `last_name`, `password_hash`, `role`, `avatar_url`) VALUES
(b'1', 11111111, '2026-03-25 15:57:52.000000', 1, 1, 'superadmin@system.local', 'Global', 'Admin', '$2a$10$klZQ.AkPGnEwnazzwlkGkOURI2asP9ocIVVSsbI6Sz2bFUUtsQcD6', 'SUPER_ADMIN', NULL),
(b'1', 11223344, '2026-03-26 23:36:14.000000', 3, 2, 'Sarra.Meddah@esprit.tn', 'sarra', 'meddah', '$2a$10$Mra93sYE1DkOT522iP4Ecu3C7qDJCh3/E46jTszRNneZhEcK/yosO', 'PROJECT_MANAGER', '/uploads/users/8561d63b-486e-4e69-862d-f23d5e8e5321.jpg'),
(b'1', 12345678, '2026-03-30 16:01:31.000000', 4, 2, 'moetaz.doghmane@esprit.tn', 'moetaz', 'dogmane', '$2a$10$jM1mLk54dKjT9aJ9WaGaaOoxQkf5u205916s0oWIcSViSyQeHwyv2', 'MEMBER', '/uploads/users/05df723d-cdaa-4ae6-82a5-44dade681823.jfif'),
(b'1', 12365479, '2026-04-10 15:28:45.000000', 5, 2, 'mekki.benmoussa@rfc.com.tn', 'Mekki', 'Ben Moussa', '$2a$10$Cuy0wJjSc7g/exU9tMyZhOeEgIdMwIELss/AeXNjuSaUE4QniIZqO', 'MEMBER', '/uploads/users/6e9b5dd5-548c-40ef-9530-99358c1a58ad.png'),
(b'1', 13265478, '2026-04-14 13:09:51.000000', 6, 4, 'salmamadeh@gmail.com', 'salma', 'meddah', '$2a$10$cZa5MgbIG5zPKeLmEkgY1uu4USyhEflgC4sLseXWL/9sp/.9NXUuC', 'ORGANIZATION_ADMIN', '/uploads/users/352de7c8-5cd9-467c-9e8c-a36560febb7d.jpg'),
(b'1', 17456321, '2026-04-14 13:11:31.000000', 7, 4, 'tina@gmail.com', 'elyes', 'tina', '$2a$10$OH6RL0Weq8gj.IpgugSfI.oYbLjIlLNIXEOQn9tKceXQHLTUmgdnO', 'PROJECT_MANAGER', '/uploads/users/3e7702cd-f44e-4203-8425-2a0989f15e0f.png'),
(b'1', 12654988, '2026-04-24 14:31:57.000000', 8, 4, 'laklak@gmail.com', 'louka', 'chien', '$2a$10$BG0s53WSOxsjm0k6pYgSYuDvJrpDsqJYmYlEP9Fmk7IqcwQtIXhe.', 'MEMBER', '/uploads/users/5aac6580-8d9c-4eb8-b5c4-b8931340db96.jpg'),
(b'1', 14523678, '2026-04-27 14:15:38.000000', 9, 2, 'imen.zouaoui@gmail.com', 'imen', 'zouaoui', '$2a$10$1Pb9BU3UvJAFiDFdewppPOW5S8YumuScSuHOBVWNXLOsjl7olnBUq', 'ORGANIZATION_ADMIN', '/uploads/users/47305890-d593-44eb-ab26-3cc566d37f7f.png');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKq4u9ne3x0xtpc5d2jdddv1ii7` (`task_id`),
  ADD KEY `FKrvlqqfne7m930gt30ev4q891n` (`project_id`);

--
-- Index pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKonjalmr7kf8970g8gu7ymueer` (`performed_by`);

--
-- Index pour la table `automation_rules`
--
ALTER TABLE `automation_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKs737ukce7oi6ir17ra5sw43bp` (`organization_id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKn2na60ukhs76ibtpt9burkm27` (`author_id`),
  ADD KEY `FKi7pp0331nbiwd2844kg78kfwb` (`task_id`),
  ADD KEY `FKgkoamotsfr3mc0pwa1qrrmwhi` (`project_id`);

--
-- Index pour la table `comment_reactions`
--
ALTER TABLE `comment_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKawck4hr9ijhcorjwdunko0824` (`comment_id`,`user_id`,`reaction_type`),
  ADD KEY `FK2t2mv78fm49m4lni9gih7kkaa` (`user_id`);

--
-- Index pour la table `milestones`
--
ALTER TABLE `milestones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2a7fp7wfu0qc1pq3wiifbksge` (`project_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`);

--
-- Index pour la table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKn2jopkbm16qv3xelbvoyjkd0g` (`user_id`);

--
-- Index pour la table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKp9pbw3flq9hkay8hdx3ypsldy` (`name`);

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK3gwrleyyq6prcnqekmkobbimd` (`organization_id`);

--
-- Index pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdki1sp2homqsdcvqm9yrix31g` (`project_id`),
  ADD KEY `FKgul2el0qjk5lsvig3wgajwm77` (`user_id`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2vjo8mbre3rvpbd6e7976b54m` (`assigned_to`),
  ADD KEY `FK76tiq4q248au3u79a8nkexoth` (`parent_task_id`),
  ADD KEY `FKsfhn82y57i3k9uxww1s007acc` (`project_id`),
  ADD KEY `FKb8b020pojs9xaw47w58sq48bb` (`depends_on_task_id`);

--
-- Index pour la table `task_history`
--
ALTER TABLE `task_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK25h9b68g60qf4qske77bm7imb` (`changed_by`),
  ADD KEY `FKjqraeud129avhcva579fhioj3` (`task_id`);

--
-- Index pour la table `task_worklogs`
--
ALTER TABLE `task_worklogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9f47sxilm3ej0ns2txvc1bchu` (`task_id`),
  ADD KEY `FKhgkuy90qpbd63p34r058xypf2` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD KEY `FKqpugllwvyv37klq7ft9m8aqxk` (`organization_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `automation_rules`
--
ALTER TABLE `automation_rules`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `comment_reactions`
--
ALTER TABLE `comment_reactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `milestones`
--
ALTER TABLE `milestones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT pour la table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `project_members`
--
ALTER TABLE `project_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `task_history`
--
ALTER TABLE `task_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `task_worklogs`
--
ALTER TABLE `task_worklogs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `FKq4u9ne3x0xtpc5d2jdddv1ii7` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `FKrvlqqfne7m930gt30ev4q891n` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Contraintes pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `FKonjalmr7kf8970g8gu7ymueer` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `automation_rules`
--
ALTER TABLE `automation_rules`
  ADD CONSTRAINT `FKs737ukce7oi6ir17ra5sw43bp` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `FKgkoamotsfr3mc0pwa1qrrmwhi` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `FKi7pp0331nbiwd2844kg78kfwb` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `FKn2na60ukhs76ibtpt9burkm27` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `comment_reactions`
--
ALTER TABLE `comment_reactions`
  ADD CONSTRAINT `FK2t2mv78fm49m4lni9gih7kkaa` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKfb7jmhiih0qcj4sykg2pcip35` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`);

--
-- Contraintes pour la table `milestones`
--
ALTER TABLE `milestones`
  ADD CONSTRAINT `FK2a7fp7wfu0qc1pq3wiifbksge` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `FKt9qjvmcl36i14utm5uptyqg84` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `FK3gwrleyyq6prcnqekmkobbimd` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Contraintes pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `FKdki1sp2homqsdcvqm9yrix31g` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `FKgul2el0qjk5lsvig3wgajwm77` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `FK2vjo8mbre3rvpbd6e7976b54m` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK76tiq4q248au3u79a8nkexoth` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `FKb8b020pojs9xaw47w58sq48bb` FOREIGN KEY (`depends_on_task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `FKsfhn82y57i3k9uxww1s007acc` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Contraintes pour la table `task_history`
--
ALTER TABLE `task_history`
  ADD CONSTRAINT `FK25h9b68g60qf4qske77bm7imb` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKjqraeud129avhcva579fhioj3` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

--
-- Contraintes pour la table `task_worklogs`
--
ALTER TABLE `task_worklogs`
  ADD CONSTRAINT `FK9f47sxilm3ej0ns2txvc1bchu` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `FKhgkuy90qpbd63p34r058xypf2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKqpugllwvyv37klq7ft9m8aqxk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
