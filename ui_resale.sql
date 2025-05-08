-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2025 at 04:20 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ui_resale`
--

-- --------------------------------------------------------

--
-- Table structure for table `ebay_accounts`
--

CREATE TABLE `ebay_accounts` (
  `user_id` varchar(255) NOT NULL,
  `access_token` text NOT NULL,
  `refresh_token` text NOT NULL,
  `access_token_expires_at` bigint(20) NOT NULL,
  `refresh_token_expires_at` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ebay_accounts`
--

INSERT INTO `ebay_accounts` (`user_id`, `access_token`, `refresh_token`, `access_token_expires_at`, `refresh_token_expires_at`) VALUES
('25', 'v^1.1#i^1#f^0#p^3#r^0#I^3#t^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', 'v^1.1#i^1#f^0#p^3#r^1#I^3#t^Ul4xMF82OjM1MkFBQjQwMTUwMUY4QUIyODQ0QkE3Njk5MDUwQjlCXzFfMSNFXjEyODQ=', 1744206515770, 0);

-- --------------------------------------------------------

--
-- Table structure for table `license_key`
--

CREATE TABLE `license_key` (
  `id` int(11) NOT NULL,
  `license_key` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `user_id` int(255) DEFAULT NULL,
  `status` enum('Not Activated','Activated','De-Activate','Expired') DEFAULT 'Not Activated',
  `payment_mode` varchar(255) DEFAULT NULL,
  `payment_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `license_key`
--

INSERT INTO `license_key` (`id`, `license_key`, `created_at`, `expires_at`, `user_id`, `status`, `payment_mode`, `payment_date`) VALUES
(70, 'NY31LDD09IH', '2025-04-04 10:03:46', '2025-04-26 00:00:00', 24, 'Activated', 'UPI', '2025-04-04'),
(72, 'ODKWL6NP7SI', '2025-04-04 10:23:36', '2025-05-04 10:23:36', 25, 'Activated', NULL, NULL),
(73, '0HUYRYYTYX1A', '2025-04-07 10:41:36', '2025-06-06 10:41:36', 25, 'Not Activated', NULL, NULL),
(74, 'EJ3KOO6ZL0E', '2025-04-07 10:41:42', '2025-07-06 10:41:42', 25, 'Not Activated', NULL, NULL),
(75, 'NELI77XXL3P', '2025-04-07 10:41:46', '2025-07-06 10:41:46', 25, 'Not Activated', NULL, NULL),
(76, 'UO7N37UWPXO', '2025-04-08 04:10:42', '2025-07-07 04:10:42', 26, 'Activated', NULL, NULL),
(77, 'O3KAFWTA96', '2025-04-09 04:10:00', '2025-04-09 04:10:00', 25, 'Expired', NULL, NULL),
(80, 'I9HGPTT2ZB', '2025-04-09 05:13:53', '2025-06-08 05:13:53', 25, 'Not Activated', 'Cash', '2025-04-09'),
(82, '1UDU87GE3WW', '2025-04-09 05:44:41', '2025-05-31 00:00:00', 28, 'Activated', 'UPI', '2025-04-09'),
(83, 'ONJE8HTYQZ8', '2025-04-09 06:35:39', '2025-05-09 06:35:39', 29, 'Activated', 'Cash', '2025-04-09');

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` int(11) NOT NULL,
  `plan_type` varchar(255) DEFAULT NULL,
  `inventory` varchar(255) NOT NULL,
  `price` varchar(255) DEFAULT NULL,
  `product_finder` varchar(255) NOT NULL,
  `platform` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`platform`)),
  `find_seller` tinyint(1) NOT NULL DEFAULT 0,
  `product_optimization` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `plan_type`, `inventory`, `price`, `product_finder`, `platform`, `find_seller`, `product_optimization`) VALUES
(18, 'Silver', '20', '0', '60', '[\"eBay\",\"Amazon\"]', 0, 0),
(19, 'Gold', '50', '499', '150', '[\"eBay\",\"Amazon\"]', 1, 0),
(21, 'Platinum', '100', '999', '200', '[\"Amazon\",\"Etsy\",\"eBay\"]', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `plugins`
--

CREATE TABLE `plugins` (
  `id` int(11) NOT NULL,
  `plugin_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plugin_name` varchar(255) DEFAULT NULL,
  `installed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plugins`
--

INSERT INTO `plugins` (`id`, `plugin_id`, `user_id`, `plugin_name`, `installed`) VALUES
(8, 1, 25, 'Product Finder', 1),
(9, 1, 26, 'Product Finder', 0),
(10, 1, 28, 'Product Finder', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auth_token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `auth_token`, `expires_at`, `created_at`) VALUES
(104, 25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpc19hZG1pbiI6MCwiaWF0IjoxNzQ0MDIyNDQ1LCJleHAiOjE3NDQ2MjcyNDV9.LBhMTbdMS1C1o_C5Zrk7juX23AoK6MspCyz8BALZ_RM', '2025-04-14 16:10:45', '2025-04-07 10:40:45'),
(114, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjksImVtYWlsIjoiZWxhbmRldjU4N0BnbWFpbC5jb20iLCJpc19hZG1pbiI6MCwiaWF0IjoxNzQ0MTgwNjk0LCJleHAiOjE3NDQ3ODU0OTR9.WPLBubvie4GZ60x6YV2fba6RycHfGtdqL9Np-NNMvG4', '2025-04-16 12:08:14', '2025-04-09 06:38:14'),
(115, 28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImVtYWlsIjoiY2hhbmRydWUuY3NhQGdtYWlsLmNvbSIsImlzX2FkbWluIjowLCJpYXQiOjE3NDQxOTM3NTksImV4cCI6MTc0NDc5ODU1OX0.Ki8eMgc2GdR40IRypwWK7zZqXKM6DrFGsyYEydtj0Fo', '2025-04-16 15:45:59', '2025-04-09 10:15:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `is_admin`, `created_at`, `updated_at`) VALUES
(2, 'revanthshiva3@gmail.com', 'revanthshiva3@gmail.com', '$2a$10$g98h6SDj1q1tIzCFxUQ8W.d1s25NhGGr8CrpgVjNZefKXsqLjvTIO', NULL, '2025-03-24 07:49:48', '2025-03-24 11:24:24'),
(24, 'elanchandru2@gmail.com', 'elanchandru2@gmail.com', '$2a$10$BVTU8MejXND5UqwzP1vCcecPRxwvaVJ95utvvuePso4htDmx8/S7.', 0, '2025-04-04 10:03:56', '2025-04-04 10:03:56'),
(25, 'admin@example.com', 'admin@example.com', '$2a$10$EUHimARTZa/gumSZ6CXpeOySoTaHImFsidCw91MIGyuna2RasG15W', 1, '2025-04-07 09:51:40', '2025-04-07 10:41:19'),
(28, 'chandrue.csa@gmail.com', 'chandrue.csa@gmail.com', '$2a$10$cpLJ50S8N94vtHk0Yf3yzuxW9GKb0GXSItWykNTANBSyZrW1Xgtrm', 0, '2025-04-09 05:45:28', '2025-04-09 10:20:09'),
(29, 'elandev587@gmail.com', 'elandev587@gmail.com', '$2a$10$fhzYZOuxeVfktfiRDcpA9ePpPPpGWiGDoacjF8fwl.pqzZcg7r52C', 0, '2025-04-09 06:37:49', '2025-04-09 06:37:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ebay_accounts`
--
ALTER TABLE `ebay_accounts`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `license_key`
--
ALTER TABLE `license_key`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_value` (`license_key`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plugins`
--
ALTER TABLE `plugins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`plugin_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_token` (`auth_token`),
  ADD UNIQUE KEY `user_id` (`user_id`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `license_key`
--
ALTER TABLE `license_key`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `plugins`
--
ALTER TABLE `plugins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
