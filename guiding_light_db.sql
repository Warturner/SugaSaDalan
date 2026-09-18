-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql112.infinityfree.com
-- Generation Time: Sep 18, 2026 at 07:47 AM
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
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `donation_id` int(11) NOT NULL,
  `donor_name` varchar(100) DEFAULT 'Anonymous',
  `contact_email` varchar(100) DEFAULT 'anonymous@example.com',
  `amount` decimal(7,2) NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `payment_method` int(1) NOT NULL,
  `status` int(1) DEFAULT 1,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`donation_id`, `donor_name`, `contact_email`, `amount`, `reference_number`, `payment_method`, `status`, `transaction_date`, `verified_by`) VALUES
(1, 'Anonymous', 'finance@streetlight.org', '1000.00', 'cs_769b8b622863b1b4822c55b0', 3, 2, '2026-09-16 09:41:48', NULL),
(2, 'Anonymous', 'finance@streetlight.org', '70.00', 'cs_00d23e6c67349d255a02ade5', 3, 2, '2026-09-16 09:50:47', NULL);

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

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`post_id`, `title`, `content_type`, `content`, `excerpt`, `image_path`, `published_date`, `author_id`, `category_id`, `is_pinned`, `pin_until`) VALUES
(33, 'test article', 'article', '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"asdasdadad test\"}]}]}', 'test', 'uploads/stories/story_6aad1d3bd13f4.png', '2026-09-18 11:15:08', 1, 3, 0, NULL),
(34, 'Article pin test', 'publication', '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}', '', 'uploads/stories/story_6aad1d61b63b4.jpeg', '2026-09-18 11:15:46', 1, 4, 1, NULL),
(35, '2024 summary docx test', 'article', '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"3. NEWSLETTER 2024\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Dear friends of Streetlight\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"An eventful year comes to an end and we look back gratefully to the last couple of months. We were able to strengthen our partnerships with the police and the City Social Welfare and Development CSWD and could build new ones like with the City Anti-Drug Abuse Council CADAC. We are thankful for the lives of vulnerable children we could save and that we helped other youth to turn away from the streets and returning to school. And â€“ as always â€“ we are grateful for your loyalty, support, and trust! Thank you so much that you will also accompany us in the following year.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"We wish you a relaxing and peaceful Christmas and a new year full of light and hope which we could forward through you to our girls.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Best regards,\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Esther Buehlmann\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Founder â€œStreetlightâ€\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Medical emergency intervention\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Streetlight was contacted by a mother of one of our girls. The 13 years old had a high fever and a bad cough for days. She was admitted in a public hospital. However, her condition still worsened and she was referred to a bigger, better equipped hospital. We visited the girl the same day in the late evening and talked to her doctor. According to her, the life of the child was in danger and she might die if she couldnâ€™t be referred to the ICU of a private hospital. She suffered from a severe pneumonia and dengue. In the Philippines, the relatives of the patient are responsible to find a vacant place. At the fifth hospital, we finally found a vacant bed in an ICU and the child could be transferred at around 3am.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"She had to stay four days in the ICU, Streetlight covered all the expenses and through this, saved her life as the family is poor and couldnâ€™t have afford a private hospital. After her recovery, we enrolled her back to school to higher her chance of a life far away from the streets and prostitution.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6b77e76_1789730155.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Major rescue operation\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"The City Social Welfare and Development CSWD organized another major rescue operation in collaboration with the police and Streetlight. We were able to rescue a total of 16 minors, among them four girls. Three of them are Streetlight clients. They were temporarily sheltered at the CSWD holding area. Streetlight visited their families and set clear conditions: they have to go back to school and be at home before the curfew hours for minors starts at 10pm. The parents have to closely monitor them. In one case, we assessed the family situation as too risky to reintegrate the child and referred her to our partner organization Philippine Island Kids International Foundation, Inc. where she can go back to school.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6bba2b8_1789730155.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6c08e87_1789730156.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"hardBreak\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"International day against prostitution\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"The international day against prostitution which on October 5 was celebrated with two activities. In the morning, owners and managers of massage establishment, night clubs, and Innâ€™s were invited. A fiscal and an employee of the Regulatory and Compliance Board RCB had lectures about laws for the protection of women and children regarding sexual abuse and harassment.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"In the evening, a team consisting of the police, CSWD, RCB, PIKIFI, and Streetlight, check the some of the above mentioned establishments. We controlled the identities of the dancers and massage therapists to ensure that no minors were hired. Furthermore, we checked Innâ€™s which are known to ignore the laws for the protection of minors. It was controlled whether they check the identity of minors and record their declarations properly in a separate log book for minors. Again, we noticed several violations and the names of these Inns were reported and noted.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Cases of child trafficking\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Shortly after the international day against prostitution, we saw a post of Facebook of a client, sowing her again inside an Inn well known for their violations. Streetlight informed the responsible of the Women and Children Protection Desk from the respective police station and together with her, we were able to rescue the minor and bringing her to the police station. The child reported that an identified individual sold her for 1000 PHP to another man from whom we also know the identity. The second man brought her inside the Inn, put her under drugs, and abused her. The client was brought to a transition center of the City Social Welfare and Development and a couple of weeks later, Streetlight referred her to a Foundation where she can go to school and is provided with everything she needs. We filed a case against both men for qualified trafficking and child abuse. They were arrested and are waiting for the trial. The court hearings will start end of next year. We expect them to get a life sentence which mean 40 years in the Philippines.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6c547db_1789730156.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"In November, the police picked up to other minors in prostitution on the streets and asked for the support of Streetlight. The pimp of the two is a police officers from the same police station which rescued them. The accused was disarmed the same day and suspended from his duty. Streetlight referred the two minors again in the transition center from CSWD and leter to another Foundation for their best well-being. The police officer is at large as he is well aware that this crime is punished with a life sentence.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"A 12 years old girl who was rescued due to violation of the curfew hours for minors and brought to the transition center, shared with Streetlight that she was forced into prostitution by the elder sister of her best friend. She shared that she wants to go back to school. The child also divulged that her best friend is a victim of trafficking by her own sister.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6c94eda_1789730156.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Like the other three victims of qualified trafficking, we brought her to the City Health Office for the testing of HIV and other Sexual Transmitted Diseases and to the Northern Mindanao Medical Center for her medico legal. We talked to her family and referred her to PIKIFI where she is safe, cared for, and enrolled to school. Streetlight and the police plan to rescue the other girl as soon as possible and we will file a case against the pimp.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Education\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Streetlight has a close collaboration with the night school program of Xavier University. They offer out of school youth the possibility to obtain their school leaving certificate. The teachers are informed that several of these teenagers live on the streets or fight with other challenging life circumstances and treat them with special care. Streetlight went three times under a bridge where a lot of teenagers live and helped those who want to go back to school with the requirements and the enrollment. The youth get an allowance from Streetlight after their class so they donâ€™t have to walk to school and\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"back. The school materials are provided by the city of Cagayan de Oro.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"}},{\"type\":\"image\",\"attrs\":{\"src\":\"/guiding_light_backend/uploads/stories/inline_6aad1d6cd58d4_1789730156.jpeg\",\"alt\":null,\"title\":null,\"width\":null,\"height\":null}},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"We visit the classes regularly, talk to the teenagers about their reasons that they are absent and try to motivate them not to drop out of school again. The common project of the city with the Xavier University is very precious for the Streetlight clients as itâ€™s easier for them to graduate from Highschool with this program which increases their chances to turn away from the streets towards a healthier life.\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Streetlight\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Guggistrasse 11\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"CH-6005 Luzern\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"link\",\"attrs\":{\"href\":\"http://www.streetlight-cdo.com\",\"target\":\"_blank\",\"rel\":\"noopener noreferrer nofollow\",\"class\":null,\"title\":null}}],\"text\":\"www.streetlight-cdo.com\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"bold\"}],\"text\":\"Spendenkonto:\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"Berner Kantonalbank AG\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"3001 Bern\"}]},{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"center\"},\"content\":[{\"type\":\"text\",\"text\":\"IBAN CH74 0079 0016 6044 1477 2\"}]}]}', '', 'uploads/stories/story_6aad1d9464095.jpg', '2026-09-18 11:16:37', 1, 3, 0, NULL);

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

--
-- Dumping data for table `story_attachments`
--

INSERT INTO `story_attachments` (`id`, `post_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_at`) VALUES
(8, 34, 'News-Letter-3.0-English.pdf', 'uploads/stories/attachments/doc_6aad1d61b684a_1789730145.pdf', 'pdf', 2642459, '2026-09-18 04:15:46');

-- --------------------------------------------------------

--
-- Table structure for table `story_categories`
--

CREATE TABLE `story_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `story_categories`
--

INSERT INTO `story_categories` (`id`, `name`) VALUES
(1, 'Announcements'),
(3, 'Events'),
(4, 'General'),
(2, 'Success Stories');

-- --------------------------------------------------------

--
-- Table structure for table `story_edit_history`
--

CREATE TABLE `story_edit_history` (
  `edit_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
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

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `name`, `role`, `email`, `image_path`, `created_at`, `display_order`) VALUES
(1, 'Jeffson Clyde Sucaldito', 'Company IT', 'jcsucaldito17762@liceo.edu.ph', 'uploads/team/team_6a8be67b8a4fc.jfif', '2026-08-24 14:34:31', 1),
(2, 'Person 2 Test', 'Dummy Test', 'Dummy@test.com', 'uploads/team/team_6a8be6a166681.png', '2026-08-24 14:37:21', 3),
(3, 'Photo Test 2', 'PfP test icon', 'ico@ico.ico', 'uploads/team/team_6a8be6b78ab29.png', '2026-08-24 14:37:43', 2),
(5, 'Row Test', 'Dummy Row', '', 'uploads/team/team_6a8be74612356.jpg', '2026-08-24 14:40:06', 2),
(6, 'Danielle Grace Bermudo Veloso', 'Company IT', 'dgveloso14876@liceo.edu.ph', 'uploads/team/team_6a8beb9e61176.jpg', '2026-08-24 14:58:38', 1),
(7, 'Row Limit dummy', 'Limit Row', 'Dummy@Dumm.com', 'uploads/team/team_6a8bebebba2a7.gif', '2026-08-24 14:59:55', 2),
(9, 'Test dummy 2', 'Tester s', 'jjj@jjj.com', 'uploads/team/team_6aacf74a6ce3e.jpg', '2026-09-18 01:33:13', 3);

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
  `role` varchar(20) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `contact_num`, `created_at`, `role`) VALUES
(1, 'admin', '$2y$10$N4NXrVT781mJyi.2Z6jWdequDv5NRjUDsODltzOZF9KB0i4d45h2G', '09171234567', '2026-07-20 12:18:36', 'admin'),
(2, 'media', '$2y$10$ypbgckLTcnzw7mO2acveg.Q/elku8VaSjnHUWaDTUu2Cl9WSYcOJO', NULL, '2026-08-08 10:04:01', 'media');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donation_id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `verified_by` (`verified_by`);

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
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `donation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `story_attachments`
--
ALTER TABLE `story_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `story_categories`
--
ALTER TABLE `story_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `story_edit_history`
--
ALTER TABLE `story_edit_history`
  MODIFY `edit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `fk_story_category` FOREIGN KEY (`category_id`) REFERENCES `story_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`);

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
  ADD CONSTRAINT `story_edit_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
