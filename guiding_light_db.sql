-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql112.infinityfree.com
-- Generation Time: Oct 19, 2026 at 03:29 AM
-- Server version: 11.4.13-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_42909551_guiding_light_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_activity_logs`
--

CREATE TABLE `account_activity_logs` (
  `log_id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` int(11) DEFAULT NULL,
  `actor_username` varchar(50) NOT NULL,
  `target_user_id` int(11) DEFAULT NULL,
  `target_username` varchar(50) NOT NULL,
  `action` varchar(40) NOT NULL,
  `details` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `donation_id` int(11) NOT NULL,
  `donor_name` varchar(100) DEFAULT 'Anonymous',
  `contact_email` varchar(100) DEFAULT 'anonymous@example.com',
  `donor_name_enc` text DEFAULT NULL,
  `contact_email_enc` text DEFAULT NULL,
  `amount` decimal(7,2) NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `payment_method` int(1) NOT NULL,
  `status` int(1) DEFAULT 1,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_security_events`
--

CREATE TABLE `login_security_events` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attempted_username` varchar(50) NOT NULL,
  `username_hash` char(64) NOT NULL,
  `ip_hash` char(64) NOT NULL,
  `event_type` enum('login_failed','login_success','login_restricted','admin_unlocked') NOT NULL,
  `details` varchar(100) NOT NULL DEFAULT '',
  `admin_actor` varchar(50) DEFAULT NULL,
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `post_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content_type` enum('article','publication') NOT NULL DEFAULT 'article',
  `content` longtext NOT NULL,
  `excerpt` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `published_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `author_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `pin_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `story_attachments`
--

CREATE TABLE `story_attachments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `story_categories`
--

CREATE TABLE `story_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `story_edit_history`
--

CREATE TABLE `story_edit_history` (
  `edit_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `editor_username` varchar(50) NOT NULL,
  `edit_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `changes_made` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `display_order` int(11) DEFAULT 999
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `contact_num` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(20) NOT NULL DEFAULT 'admin',
  `active_session_hash` char(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_activity_logs`
--
ALTER TABLE `account_activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_account_activity_created` (`created_at`),
  ADD KEY `idx_account_activity_actor` (`actor_user_id`),
  ADD KEY `idx_account_activity_target` (`target_user_id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donation_id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indexes for table `login_security_events`
--
ALTER TABLE `login_security_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_login_security_username_time` (`username_hash`,`occurred_at`),
  ADD KEY `idx_login_security_ip_time` (`ip_hash`,`occurred_at`),
  ADD KEY `idx_login_security_event_time` (`event_type`,`occurred_at`),
  ADD KEY `idx_login_security_time` (`occurred_at`),
  ADD KEY `idx_login_security_user` (`user_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `fk_story_category` (`category_id`);

--
-- Indexes for table `story_attachments`
--
ALTER TABLE `story_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_story_attachment` (`post_id`);

--
-- Indexes for table `story_categories`
--
ALTER TABLE `story_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `story_edit_history`
--
ALTER TABLE `story_edit_history`
  ADD PRIMARY KEY (`edit_id`),
  ADD KEY `story_edit_history_ibfk_2` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_activity_logs`
--
ALTER TABLE `account_activity_logs`
  MODIFY `log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `donation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_security_events`
--
ALTER TABLE `login_security_events`
  MODIFY `event_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `story_attachments`
--
ALTER TABLE `story_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `story_categories`
--
ALTER TABLE `story_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `story_edit_history`
--
ALTER TABLE `story_edit_history`
  MODIFY `edit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_activity_logs`
--
ALTER TABLE `account_activity_logs`
  ADD CONSTRAINT `fk_account_activity_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_account_activity_target` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `login_security_events`
--
ALTER TABLE `login_security_events`
  ADD CONSTRAINT `fk_login_security_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `fk_story_category` FOREIGN KEY (`category_id`) REFERENCES `story_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `story_attachments`
--
ALTER TABLE `story_attachments`
  ADD CONSTRAINT `fk_story_attachment` FOREIGN KEY (`post_id`) REFERENCES `stories` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `story_edit_history`
--
ALTER TABLE `story_edit_history`
  ADD CONSTRAINT `story_edit_history_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `stories` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `story_edit_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
