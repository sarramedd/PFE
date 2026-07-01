-- ============================================================================
-- Donnees de seed PostgreSQL pour GestionProjet
-- ============================================================================
-- Genere a partir de dump.sql (MariaDB phpMyAdmin) -> converti pour PostgreSQL.
-- Les CREATE TABLE ne sont PAS inclus : Hibernate les genere automatiquement
-- grace a spring.jpa.hibernate.ddl-auto=update.
--
-- Usage :
--   psql -h <postgres_fqdn> -U <user> -d gestion_projet -f dump.postgres.sql
--
-- IMPORTANT :
--   1) Lancer d'abord le backend Spring Boot une fois sur la DB Azure
--      pour que Hibernate cree les tables.
--   2) Puis charger ce script pour avoir les donnees de demo.
--   3) Si vous demarrez sur DB vide sans seed, l'app marche aussi : la
--      premiere creation d'organisation se fait via le endpoint /bootstrap.
-- ============================================================================

BEGIN;

INSERT INTO organizations (created_at, id, description, name, logo_url) VALUES
('2026-03-25 15:57:51.000000', 1, 'Technical organization for global administration', 'SYSTEM', NULL),
('2026-03-25 16:04:06.000000', 2, 'RFC', 'RFC', '/uploads/organizations/4ed4d725-7d38-4cdb-993d-cc0a4f0a9d42.png'),
('2026-03-26 22:33:11.000000', 3, 'zaineb ben mesaoud', 'zaineb', '/uploads/organizations/e67965a6-84fc-41ad-b6af-1e8a54b9c719.png'),
('2026-04-14 13:08:01.000000', 4, '/', 'Google', '/uploads/organizations/0b491bb5-4710-4735-8a92-632c542812ea.png');

INSERT INTO users (is_active, cin, created_at, id, organization_id, email, first_name, last_name, password_hash, role, avatar_url) VALUES
(true, 11111111, '2026-03-25 15:57:52.000000', 1, 1, 'superadmin@system.local', 'Global', 'Admin', '$2a$10$klZQ.AkPGnEwnazzwlkGkOURI2asP9ocIVVSsbI6Sz2bFUUtsQcD6', 'SUPER_ADMIN', NULL),
(true, 11223344, '2026-03-26 23:36:14.000000', 3, 2, 'Sarra.Meddah@esprit.tn', 'sarra', 'meddah', '$2a$10$Mra93sYE1DkOT522iP4Ecu3C7qDJCh3/E46jTszRNneZhEcK/yosO', 'PROJECT_MANAGER', '/uploads/users/8561d63b-486e-4e69-862d-f23d5e8e5321.jpg'),
(true, 12345678, '2026-03-30 16:01:31.000000', 4, 2, 'moetaz.doghmane@esprit.tn', 'moetaz', 'dogmane', '$2a$10$jM1mLk54dKjT9aJ9WaGaaOoxQkf5u205916s0oWIcSViSyQeHwyv2', 'MEMBER', '/uploads/users/05df723d-cdaa-4ae6-82a5-44dade681823.jfif'),
(true, 12365479, '2026-04-10 15:28:45.000000', 5, 2, 'mekki.benmoussa@rfc.com.tn', 'Mekki', 'Ben Moussa', '$2a$10$Cuy0wJjSc7g/exU9tMyZhOeEgIdMwIELss/AeXNjuSaUE4QniIZqO', 'MEMBER', '/uploads/users/6e9b5dd5-548c-40ef-9530-99358c1a58ad.png'),
(true, 13265478, '2026-04-14 13:09:51.000000', 6, 4, 'salmamadeh@gmail.com', 'salma', 'meddah', '$2a$10$cZa5MgbIG5zPKeLmEkgY1uu4USyhEflgC4sLseXWL/9sp/.9NXUuC', 'ORGANIZATION_ADMIN', '/uploads/users/352de7c8-5cd9-467c-9e8c-a36560febb7d.jpg'),
(true, 17456321, '2026-04-14 13:11:31.000000', 7, 4, 'tina@gmail.com', 'elyes', 'tina', '$2a$10$OH6RL0Weq8gj.IpgugSfI.oYbLjIlLNIXEOQn9tKceXQHLTUmgdnO', 'PROJECT_MANAGER', '/uploads/users/3e7702cd-f44e-4203-8425-2a0989f15e0f.png'),
(true, 12654988, '2026-04-24 14:31:57.000000', 8, 4, 'laklak@gmail.com', 'louka', 'chien', '$2a$10$BG0s53WSOxsjm0k6pYgSYuDvJrpDsqJYmYlEP9Fmk7IqcwQtIXhe.', 'MEMBER', '/uploads/users/5aac6580-8d9c-4eb8-b5c4-b8931340db96.jpg'),
(true, 14523678, '2026-04-27 14:15:38.000000', 9, 2, 'imen.zouaoui@gmail.com', 'imen', 'zouaoui', '$2a$10$1Pb9BU3UvJAFiDFdewppPOW5S8YumuScSuHOBVWNXLOsjl7olnBUq', 'ORGANIZATION_ADMIN', '/uploads/users/47305890-d593-44eb-ab26-3cc566d37f7f.png');

INSERT INTO projects (end_date, start_date, created_at, id, organization_id, description, name, status) VALUES
('2027-06-22', '2026-03-30', '2026-03-30 11:26:25.000000', 1, 2, 'dev dans e commerce', 'website', 'ACTIVE'),
('2026-06-24', '2026-04-29', '2026-04-27 14:09:56.000000', 2, 4, 'lkjhy', 'code', 'ACTIVE');

INSERT INTO project_members (id, joined_at, project_id, user_id, role_in_project) VALUES
(1, '2026-03-30 11:26:25.000000', 1, 3, 'ADMIN'),
(2, '2026-03-30 16:01:55.000000', 1, 4, 'MEMBER'),
(3, '2026-04-10 15:31:56.000000', 1, 5, 'MEMBER'),
(4, '2026-04-27 14:09:56.000000', 2, 7, 'ADMIN'),
(5, '2026-04-27 19:13:33.000000', 2, 8, 'MEMBER');

INSERT INTO milestones (id, completed, created_at, description, due_date, title, project_id) VALUES
(1, false, '2026-04-27 14:17:20.000000', 'j1', '2026-04-27', 'jalon 1', 1);

INSERT INTO tasks (due_date, assigned_to, created_at, id, parent_task_id, project_id, description, title, priority, status, estimated_hours, depends_on_task_id) VALUES
('2026-04-23', 4, '2026-03-30 16:26:57.000000', 1, NULL, 1, 'testttttt', 'diagramme de classe', NULL, 'DONE', NULL, NULL),
('2026-03-30', 4, '2026-03-30 16:27:25.000000', 2, NULL, 1, 'tache 222222', 'tache 2', NULL, 'DONE', NULL, NULL),
('2026-04-10', 4, '2026-03-30 16:38:18.000000', 3, NULL, 1, 'tache 3', 'tache 3', NULL, 'DONE', NULL, NULL),
('2026-04-13', 3, '2026-03-30 17:43:04.000000', 4, NULL, 1, 'valider les taches', 'surveiller', NULL, 'DONE', NULL, NULL),
('2026-03-31', 3, '2026-03-30 21:32:25.000000', 5, 1, 1, 'telecharger template back et front', 'preparer template', NULL, 'DONE', 12, 1),
('2026-04-30', 5, '2026-04-10 16:10:49.000000', 7, 1, 1, 'preparation bdd', 'bdd', NULL, 'DONE', 7, 1),
('2026-04-30', 8, '2026-04-27 14:10:39.000000', 8, NULL, 2, 'laklak', 'laklak', NULL, 'IN_PROGRESS', 3, NULL);

INSERT INTO comments (author_id, created_at, id, task_id, content, project_id) VALUES
(NULL, '2026-03-30 11:41:01.000000', 1, NULL, 'hi', NULL),
(3, '2026-03-30 11:41:35.000000', 2, NULL, 'salut', 1),
(4, '2026-03-30 16:03:58.000000', 3, NULL, 'salut sara3', 1),
(3, '2026-03-30 18:12:04.000000', 4, 4, 'en cours', 1),
(3, '2026-03-30 18:16:03.000000', 5, 4, 'tache', 1),
(5, '2026-04-10 16:12:09.000000', 6, 7, 'en cours', 1),
(5, '2026-04-10 16:12:17.000000', 7, 7, 'dd', 1),
(3, '2026-04-24 14:24:18.000000', 8, NULL, 'l', 1);

INSERT INTO attachments (id, task_id, uploaded_at, file_name, file_path, project_id) VALUES
(1, 4, '2026-03-30 18:14:26.000000', 'Sarra Meddah (1).pdf', '/uploads/task-attachments/7bbb9230-c350-4d0e-a93f-ff8a20837c7a_Sarra_Meddah__1_.pdf', NULL);

INSERT INTO audit_logs (entity_id, id, performed_by, timestamp, action, entity_type) VALUES
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

INSERT INTO notifications (is_read, created_at, id, user_id, message, read_at, type) VALUES
(true, '2026-03-30 16:01:55.000000', 1, 4, 'You have been added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:03:58.000000', 2, 3, 'New message from moetaz dogmane in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 16:26:58.000000', 3, 4, 'A new task \"diagramme de classe\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:26:58.000000', 4, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:27:25.000000', 5, 4, 'A new task \"tache 2\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:27:25.000000', 6, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:36:57.000000', 7, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 16:36:57.000000', 8, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:37:21.000000', 9, 3, 'Task \"tache 2\" status changed to TODO.', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 16:37:21.000000', 10, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:38:18.000000', 11, 3, 'A new task \"tache 3\" was added to project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 16:38:18.000000', 12, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 16:39:15.000000', 13, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 16:39:16.000000', 14, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 17:24:05.000000', 15, 3, 'Task \"tache 2\" status changed to TODO.', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 17:24:05.000000', 16, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 17:43:04.000000', 17, 4, 'A new task \"surveiller\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 17:43:04.000000', 18, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 18:11:08.000000', 19, 3, 'Task \"tache 2\" status changed to DONE.', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-03-30 18:11:08.000000', 20, 4, 'You have been assigned to task \"tache 2\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 18:12:04.000000', 21, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 18:16:03.000000', 22, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 21:32:25.000000', 23, 4, 'A new task \"preparer template\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-03-30 21:32:25.000000', 24, 3, 'You have been assigned to task \"preparer template\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-04-10 15:30:33.000000', 25, 4, 'Task \"tache 3\" status changed to IN_PROGRESS.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:33.000000', 26, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:34.000000', 27, 4, 'Task \"tache 3\" status changed to DONE.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:34.000000', 28, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:35.000000', 29, 4, 'Task \"tache 3\" status changed to TODO.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:35.000000', 30, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:59.000000', 31, 4, 'Task \"diagramme de classe\" was updated.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:30:59.000000', 32, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:31:12.000000', 33, 4, 'Task \"surveiller\" was updated.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:31:12.000000', 34, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-04-10 15:31:56.000000', 35, 5, 'You have been added to project \"website\".', NULL, NULL),
(true, '2026-04-10 15:33:35.000000', 36, 4, 'A new task \"base de donnees\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:33:35.000000', 37, 5, 'A new task \"base de donnees\" was added to project \"website\".', NULL, NULL),
(true, '2026-04-10 15:33:36.000000', 38, 5, 'You have been assigned to task \"base de donnees\".', NULL, NULL),
(true, '2026-04-10 15:34:19.000000', 39, 4, 'Task \"base de donnees\" was deleted.', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 15:34:19.000000', 40, 5, 'Task \"base de donnees\" was deleted.', NULL, NULL),
(true, '2026-04-10 15:34:19.000000', 41, 5, 'You have been assigned to task \"base de donnees\".', NULL, NULL),
(true, '2026-04-10 16:10:49.000000', 42, 4, 'A new task \"bdd\" was added to project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 16:10:49.000000', 43, 5, 'A new task \"bdd\" was added to project \"website\".', NULL, NULL),
(true, '2026-04-10 16:10:49.000000', 44, 5, 'You have been assigned to task \"bdd\".', NULL, NULL),
(true, '2026-04-10 16:12:09.000000', 45, 3, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-04-10 16:12:09.000000', 46, 4, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-10 16:12:17.000000', 47, 3, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:56.000000', NULL),
(true, '2026-04-10 16:12:17.000000', 48, 4, 'New message from Mekki Ben Moussa in project \"website\".', '2026-04-27 14:24:08.000000', NULL),
(true, '2026-04-24 14:24:18.000000', 49, 4, 'New message from sarra meddah in project \"website\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(false, '2026-04-24 14:24:18.000000', 50, 5, 'New message from sarra meddah in project \"website\".', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 12:05:46.000000', 51, 3, 'Task \"tache 3\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(false, '2026-04-27 12:05:46.000000', 52, 5, 'Task \"tache 3\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 12:05:46.000000', 53, 4, 'You have been assigned to task \"tache 3\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 12:06:04.000000', 54, 3, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(false, '2026-04-27 12:06:04.000000', 55, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 12:06:04.000000', 56, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 12:06:29.000000', 57, 3, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(false, '2026-04-27 12:06:29.000000', 58, 5, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 12:06:29.000000', 59, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:10:39.000000', 60, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:12:35.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:10:48.000000', 61, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:12:35.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:22:57.000000', 62, 3, 'Automation: task \"diagramme de classe\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(true, '2026-04-27 14:22:57.000000', 63, 4, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(false, '2026-04-27 14:22:57.000000', 64, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 14:22:57.000000', 65, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:22:59.000000', 66, 3, 'Automation: task \"bdd\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(true, '2026-04-27 14:22:59.000000', 67, 4, 'Task \"bdd\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(false, '2026-04-27 14:22:59.000000', 68, 5, 'Task \"bdd\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(false, '2026-04-27 14:22:59.000000', 69, 5, 'You have been assigned to task \"bdd\".', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 14:23:06.000000', 70, 3, 'Automation: task \"surveiller\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(true, '2026-04-27 14:23:06.000000', 71, 4, 'Task \"surveiller\" status changed to DONE.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(false, '2026-04-27 14:23:06.000000', 72, 5, 'Task \"surveiller\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 14:23:06.000000', 73, 3, 'You have been assigned to task \"surveiller\".', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:23:20.000000', 74, 4, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(false, '2026-04-27 14:23:20.000000', 75, 5, 'Task \"diagramme de classe\" status changed to IN_PROGRESS.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 14:23:20.000000', 76, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 14:24:02.000000', 77, 3, 'Automation: task \"diagramme de classe\" reached status DONE.', '2026-04-27 14:24:56.000000', 'AUTOMATION'),
(true, '2026-04-27 14:24:02.000000', 78, 3, 'Task \"diagramme de classe\" status changed to DONE.', '2026-04-27 14:24:56.000000', 'TASK_UPDATE'),
(false, '2026-04-27 14:24:02.000000', 79, 5, 'Task \"diagramme de classe\" status changed to DONE.', NULL, 'TASK_UPDATE'),
(true, '2026-04-27 14:24:02.000000', 80, 4, 'You have been assigned to task \"diagramme de classe\".', '2026-04-27 14:24:08.000000', 'TASK_UPDATE'),
(true, '2026-04-27 19:13:33.000000', 81, 8, 'You have been added to project \"code\".', '2026-04-27 19:13:48.000000', 'GENERAL'),
(true, '2026-04-27 19:14:00.000000', 82, 7, 'Task \"laklak\" status changed to IN_PROGRESS.', '2026-04-27 19:14:54.000000', 'TASK_UPDATE'),
(true, '2026-04-27 19:14:00.000000', 83, 8, 'You have been assigned to task \"laklak\".', '2026-04-27 19:14:29.000000', 'TASK_UPDATE');

INSERT INTO notification_preferences (id, automation_enabled, daily_digest_enabled, due_reminder_enabled, email_enabled, in_app_enabled, overload_alert_enabled, user_id) VALUES
(1, true, true, true, false, true, true, 4),
(2, true, true, true, false, true, true, 5),
(3, true, true, true, false, true, true, 3),
(4, true, true, true, true, true, true, 1),
(5, true, true, true, false, true, true, 8),
(6, true, true, true, true, true, true, 9),
(7, true, true, true, false, true, true, 7);

INSERT INTO automation_rules (id, action_type, created_at, enabled, follow_up_delay_days, follow_up_title_template, name, trigger_status, organization_id) VALUES
(1, 'NOTIFY_PROJECT_MANAGER', '2026-04-27 14:17:36.000000', false, 3, '', 'fist', 'TODO', 2),
(2, 'NOTIFY_PROJECT_MANAGER', '2026-04-27 14:22:20.000000', true, 3, '', '2hg', 'DONE', 2);

INSERT INTO task_history (id, change_type, created_at, new_value, previous_value, changed_by, task_id) VALUES
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

INSERT INTO task_worklogs (id, created_at, minutes_spent, notes, work_date, task_id, user_id) VALUES
(1, '2026-04-27 12:03:47.000000', 1, '', '2026-04-27', 4, 3),
(2, '2026-04-27 13:33:43.000000', 1, '', '2026-04-27', 4, 3),
(3, '2026-04-27 19:12:59.000000', 1, '', '2026-04-27', 8, 8);
-- ============================================================================
-- Reset des sequences PostgreSQL (apres INSERT avec ID explicite)
-- ============================================================================

SELECT setval(pg_get_serial_sequence('organizations', 'id'), COALESCE((SELECT MAX(id) FROM organizations), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval(pg_get_serial_sequence('project_members', 'id'), COALESCE((SELECT MAX(id) FROM project_members), 1));
SELECT setval(pg_get_serial_sequence('milestones', 'id'), COALESCE((SELECT MAX(id) FROM milestones), 1));
SELECT setval(pg_get_serial_sequence('tasks', 'id'), COALESCE((SELECT MAX(id) FROM tasks), 1));
SELECT setval(pg_get_serial_sequence('comments', 'id'), COALESCE((SELECT MAX(id) FROM comments), 1));
SELECT setval(pg_get_serial_sequence('comment_reactions', 'id'), COALESCE((SELECT MAX(id) FROM comment_reactions), 1));
SELECT setval(pg_get_serial_sequence('attachments', 'id'), COALESCE((SELECT MAX(id) FROM attachments), 1));
SELECT setval(pg_get_serial_sequence('audit_logs', 'id'), COALESCE((SELECT MAX(id) FROM audit_logs), 1));
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE((SELECT MAX(id) FROM notifications), 1));
SELECT setval(pg_get_serial_sequence('notification_preferences', 'id'), COALESCE((SELECT MAX(id) FROM notification_preferences), 1));
SELECT setval(pg_get_serial_sequence('automation_rules', 'id'), COALESCE((SELECT MAX(id) FROM automation_rules), 1));
SELECT setval(pg_get_serial_sequence('task_history', 'id'), COALESCE((SELECT MAX(id) FROM task_history), 1));
SELECT setval(pg_get_serial_sequence('task_worklogs', 'id'), COALESCE((SELECT MAX(id) FROM task_worklogs), 1));

COMMIT;
