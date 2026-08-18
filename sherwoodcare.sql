-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 17, 2026 at 04:16 PM
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
-- Database: `sherwoodcare`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `rent_monthly` tinyint(1) DEFAULT 0,
  `rent_monthly_email` tinyint(1) DEFAULT 0,
  `rent_fortnightly` tinyint(1) DEFAULT 0,
  `rent_fortnightly_email` tinyint(1) DEFAULT 0,
  `da_weekly` tinyint(1) DEFAULT 0,
  `da_weekly_email` tinyint(1) DEFAULT 0,
  `social_fortnightly` tinyint(1) DEFAULT 0,
  `social_fortnightly_email` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `full_name`, `rent_monthly`, `rent_monthly_email`, `rent_fortnightly`, `rent_fortnightly_email`, `da_weekly`, `da_weekly_email`, `social_fortnightly`, `social_fortnightly_email`, `created_at`, `updated_at`) VALUES
(1, 'Beasley Jessica', 0, 0, 1, 0, 1, 1, 1, 1, '2026-01-03 14:15:06', '2026-01-03 14:40:52');

-- --------------------------------------------------------

--
-- Table structure for table `customer_invoices`
--

CREATE TABLE `customer_invoices` (
  `invoice_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_date` date NOT NULL,
  `invoice_no` varchar(100) DEFAULT NULL,
  `memory` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_due` decimal(12,2) NOT NULL DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_notes`
--

CREATE TABLE `customer_notes` (
  `note_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_notes`
--

INSERT INTO `customer_notes` (`note_id`, `customer_id`, `title`, `content`, `priority`, `due_date`, `attachment_url`, `attachment_name`, `is_completed`, `created_at`, `updated_at`) VALUES
(1, 1, '', 'tăng level cho Jenifer Bell', 'medium', NULL, NULL, NULL, 0, '2026-01-09 14:46:47', '2026-01-09 14:46:53'),
(2, 1, 'Test Notification', 'This is a test note for notification', 'high', '2026-01-10', NULL, NULL, 0, '2026-01-09 15:23:45', '2026-01-09 15:23:45'),
(3, 1, 'Test Notification', 'This is a test note for notification', 'high', '2026-01-10', NULL, NULL, 1, '2026-01-09 15:23:52', '2026-01-09 15:37:28');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `preferred_name` varchar(100) DEFAULT NULL,
  `level` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `last_name`, `first_name`, `preferred_name`, `level`, `created_at`, `updated_at`) VALUES
(3, 'Sethunathan', ' Aswini', 'Ash S', 'HC Level 2 FT/PT', '2026-01-08 16:09:14', '2026-01-08 16:09:14'),
(4, 'Crawford', '  Barbara', 'Barbara C', 'HC Level 2 CA', '2026-01-08 16:10:22', '2026-01-08 16:10:22'),
(5, 'Wigg', ' Carolyn', 'Carolyn', 'HC Level 3 CA', '2026-01-08 16:10:49', '2026-01-08 16:10:49'),
(6, 'Penfold', ' Daved', 'Daved', 'HC Level 1 CA', '2026-01-08 16:11:30', '2026-01-08 16:11:30'),
(7, 'Smith', ' James', 'Jim', 'HC Level 1 CA', '2026-01-08 16:12:05', '2026-01-08 16:12:05'),
(8, 'Peillon', ' Joshua', 'Joshua', 'HC Level 1 CA', '2026-01-08 16:12:27', '2026-01-08 16:12:27'),
(9, 'Bell', ' Jennifer', 'Jennifer', 'HC Level 2 CA', '2026-01-08 16:12:51', '2026-01-09 14:48:32'),
(10, 'Watson', ' Justin', 'Justin', 'HC Level 1 CA', '2026-01-08 16:13:09', '2026-01-08 16:13:09'),
(11, 'Byatt', ' Karen Marie', 'Karen', 'HC Level 2 CA', '2026-01-08 16:13:26', '2026-01-08 16:13:26'),
(12, 'Hammer', ' Kerry', 'Kerry', 'HC Level 4 CA', '2026-01-08 16:13:43', '2026-01-08 16:13:43'),
(13, 'Gustiantoro', ' Liana', 'Liana', 'HC Level 1 CA', '2026-01-08 16:14:02', '2026-01-08 16:14:02'),
(14, 'Grech', ' Maureen', 'Maureen', 'Lvl 1 EN Casual', '2026-01-08 16:14:20', '2026-01-08 16:14:20'),
(15, 'Robinson', ' Patricia', 'Patricia', 'HC Level 2 FT/PT', '2026-01-08 16:14:42', '2026-01-08 16:14:42'),
(16, 'Chapman', ' Rachel', 'Rachel C', 'HC Level 1 CA', '2026-01-08 16:15:19', '2026-01-08 16:15:19'),
(17, 'Muliaga', ' Faleseu', 'Rebecca', 'HC Level 1 CA', '2026-01-08 16:15:38', '2026-01-08 16:15:38'),
(18, 'Angus', ' Serina', 'Serina', 'HC Level 1 CA', '2026-01-08 16:15:58', '2026-01-08 16:15:58'),
(19, 'Farrell', ' Shontai', 'Shontai', 'HC Level 4 FT/PT', '2026-01-08 16:16:19', '2026-01-08 16:16:19'),
(20, 'Nguyen', ' Thuong', 'Thuong', 'HC Level 1 CA', '2026-01-08 16:16:36', '2026-01-08 16:16:36'),
(21, 'Bodley', ' Tania', 'Tania', 'HC Level 3 CA', '2026-01-08 16:16:59', '2026-01-08 16:16:59'),
(22, 'Angus', ' Tiarna', ' Tiarna', 'HC Level 2 FT/PT', '2026-01-08 16:17:17', '2026-01-08 16:17:17'),
(23, 'Fox', ' Tracey', 'Tracey', 'HC Level 1 CA', '2026-01-08 16:17:34', '2026-01-08 16:17:34'),
(24, 'McKinnon', ' Barbara', 'Barb M', 'HC Level 2 CA', '2026-01-08 16:18:01', '2026-01-08 16:18:01'),
(25, 'Smith', ' Angela', ' Ange', 'HC Level 4 CA/Fix Sal Bonus EOM', '2026-01-08 16:18:25', '2026-01-08 16:18:25'),
(26, 'Babu', ' Manu', 'Manu', 'HC Level 1 CA', '2026-01-08 16:18:41', '2026-01-08 16:18:41'),
(27, 'Muliaga', ' Faleseu', 'Tash', 'HC Level 1 CA', '2026-01-08 16:18:58', '2026-01-08 16:18:58'),
(28, 'Biwot', 'Daisy', 'Daisy', 'HC Level 1 CA', '2026-01-08 16:19:15', '2026-01-08 16:19:15'),
(29, 'Smith', ' Jacqueline', ' Jacqueline', 'HC Level 1 CA', '2026-01-08 16:19:40', '2026-01-08 16:19:40');

-- --------------------------------------------------------

--
-- Table structure for table `employee_notes`
--

CREATE TABLE `employee_notes` (
  `note_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `attachment_url` varchar(500) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_notes`
--

INSERT INTO `employee_notes` (`note_id`, `employee_id`, `title`, `content`, `priority`, `due_date`, `is_completed`, `attachment_url`, `attachment_name`, `created_at`, `updated_at`) VALUES
(1, 29, 'Tăng level', 'ngày 23/10/2026 đồng ý tăng level', 'low', NULL, 0, '/uploads/employee-notes/note-1767971228433-274312167.pdf', 'Giay khai sinh.pdf', '2026-01-09 15:07:08', '2026-01-09 15:15:55'),
(3, 29, 'Tăng lương', 'Ada approved', 'medium', '2026-01-10', 0, NULL, NULL, '2026-01-09 15:16:20', '2026-01-09 15:16:20');

-- --------------------------------------------------------

--
-- Table structure for table `employers`
--

CREATE TABLE `employers` (
  `employer_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `rent_monthly` tinyint(1) DEFAULT 0,
  `rent_monthly_email` tinyint(1) DEFAULT 0,
  `rent_fortnightly` tinyint(1) DEFAULT 0,
  `rent_fortnightly_email` tinyint(1) DEFAULT 0,
  `da_weekly` tinyint(1) DEFAULT 0,
  `da_weekly_email` tinyint(1) DEFAULT 0,
  `social_fortnightly` tinyint(1) DEFAULT 0,
  `social_fortnightly_email` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_nexgenus`
--

CREATE TABLE `payroll_nexgenus` (
  `id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_nexgenus`
--

INSERT INTO `payroll_nexgenus` (`id`, `start_date`, `created_at`, `updated_at`) VALUES
(2, '2026-01-01', '2026-01-07 23:41:23', '2026-01-07 23:41:23');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_nexgenus_entries`
--

CREATE TABLE `payroll_nexgenus_entries` (
  `id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `row_number` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `total_income` varchar(255) DEFAULT NULL,
  `employee_bhxh` varchar(255) DEFAULT NULL,
  `employee_bhyt` varchar(255) DEFAULT NULL,
  `employee_bhtn` varchar(255) DEFAULT NULL,
  `employer_bhxh` varchar(255) DEFAULT NULL,
  `employer_tnld` varchar(255) DEFAULT NULL,
  `employer_bhyt` varchar(255) DEFAULT NULL,
  `employer_bhtn` varchar(255) DEFAULT NULL,
  `employer_kpcd` varchar(255) DEFAULT NULL,
  `pit` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_nexgenus_entries`
--

INSERT INTO `payroll_nexgenus_entries` (`id`, `payroll_id`, `row_number`, `code`, `total_income`, `employee_bhxh`, `employee_bhyt`, `employee_bhtn`, `employer_bhxh`, `employer_tnld`, `employer_bhyt`, `employer_bhtn`, `employer_kpcd`, `pit`, `created_at`, `updated_at`) VALUES
(201, 1, 1, 'AU.C.0002.05', '20,800,000', '1,600,000', '300,000', '200,000', '3,400,000', '100,000', '600,000', '200,000', '400,000', '125,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(202, 1, 2, 'AU.C.0002.06', '18,334,545', '1,280,000', '240,000', '160,000', '2,720,000', '80,000', '480,000', '160,000', '320,000', '-', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(203, 1, 3, 'AU.C.0002.06', '18,294,545', '1,280,000', '240,000', '160,000', '2,720,000', '80,000', '480,000', '160,000', '320,000', '166,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(204, 1, 4, 'AU.C.0002.06', '18,880,000', '1,320,000', '247,500', '165,000', '2,805,000', '82,500', '495,000', '165,000', '330,000', '188,375', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(205, 1, 5, 'AU.C.0002.06', '22,800,000', '1,760,000', '330,000', '220,000', '3,740,000', '110,000', '660,000', '220,000', '440,000', '214,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(206, 1, 6, 'AU.C.0002.06', '17,709,091', '1,240,000', '232,500', '155,000', '2,635,000', '77,500', '465,000', '155,000', '310,000', '143,625', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(207, 1, 7, 'AU.C.0002.06', '25,385,455', '1,800,000', '337,500', '225,000', '3,825,000', '112,500', '675,000', '225,000', '450,000', '236,875', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(208, 1, 8, 'AU.C.0002.06', '31,970,909', '2,280,000', '427,500', '285,000', '4,845,000', '142,500', '855,000', '285,000', '570,000', '320,750', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(209, 1, 9, 'AU.C.0002.06', '30,507,525', '2,376,602', '445,613', '297,075', '5,050,279', '148,538', '891,226', '297,075', '594,151', '428,824', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(210, 1, 10, 'AU.C.0002.06', '24,845,455', '1,840,000', '345,000', '230,000', '3,910,000', '115,000', '690,000', '230,000', '460,000', '708,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(211, 1, 11, 'AU.C.0002.06', '8,720,244', '-', '-', '-', '-', '-', '-', '-', '-', '808,024', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(212, 1, 12, 'AU.C.0002.06', '10,150,554', '-', '-', '-', '-', '-', '-', '-', '-', '939,055', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(213, 1, 13, 'AU.C.0002.06', '10,408,939', '-', '-', '-', '-', '-', '-', '-', '-', '960,894', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(214, 1, 14, 'AU.C.0002.06', '10,408,939', '-', '-', '-', '-', '-', '-', '-', '-', '960,894', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(215, 1, 15, 'AU.C.0002.06', '10,904,265', '-', '-', '-', '-', '-', '-', '-', '-', '1,022,427', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(216, 1, 16, 'AU.C.0002.06', '34,722,201', '2,481,761', '465,330', '310,220', '5,273,743', '155,110', '930,661', '310,220', '620,440', '1,104,706', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(217, 1, 17, 'AU.C.0002.06', '16,800,000', '-', '-', '-', '-', '-', '-', '-', '-', '1,600,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(218, 1, 18, 'AU.C.0002.06', '41,512,290', '3,256,983', '610,684', '407,123', '6,921,089', '203,561', '1,221,369', '407,123', '814,246', '2,557,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(219, 1, 19, 'AU.C.0002.10', '51,800,000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '10,200,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(220, 1, 20, 'AU.C.0003.01', '24,760,000', '1,920,000', '360,000', '240,000', '4,080,000', '120,000', '720,000', '240,000', '480,000', '84,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(221, 1, 21, 'AU.C.0003.01', '17,800,000', '1,360,000', '255,000', '170,000', '2,890,000', '85,000', '510,000', '170,000', '340,000', '210,750', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(222, 1, 22, 'AU.C.0003.01', '27,800,000', '2,160,000', '405,000', '270,000', '4,590,000', '135,000', '810,000', '270,000', '540,000', '626,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(223, 1, 23, 'AU.C.0003.04', '20,800,000', '1,600,000', '300,000', '200,000', '3,400,000', '100,000', '600,000', '200,000', '400,000', '-', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(224, 1, 24, 'AU.C.0006.02', '15,992,727', '1,280,000', '240,000', '160,000', '2,720,000', '80,000', '480,000', '160,000', '320,000', '129,636', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(225, 1, 25, 'AU.C.0006.02', '17,720,000', '1,360,000', '255,000', '170,000', '2,890,000', '85,000', '510,000', '170,000', '340,000', '210,750', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(226, 1, 26, 'AU.C.0010.06', '23,285,714', '-', '-', '-', '-', '-', '-', '-', '-', '2,228,571', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(227, 1, 27, 'AU.E.0004.02', '28,300,000', '2,200,000', '412,500', '275,000', '4,675,000', '137,500', '825,000', '275,000', '550,000', '240,625', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(228, 1, 28, 'AU.E.0004.02', '28,800,000', '2,240,000', '420,000', '280,000', '4,760,000', '140,000', '840,000', '280,000', '560,000', '276,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(229, 1, 29, 'AU.E.0004.02', '20,260,000', '1,560,000', '292,500', '195,000', '3,315,000', '97,500', '585,000', '195,000', '390,000', '395,250', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(230, 1, 30, 'AU.E.0004.02', '22,800,000', '1,760,000', '330,000', '220,000', '3,740,000', '110,000', '660,000', '220,000', '440,000', '619,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(231, 1, 31, 'AU.E.0004.02', '23,800,000', '1,840,000', '345,000', '230,000', '3,910,000', '115,000', '690,000', '230,000', '460,000', '708,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(232, 1, 32, 'AU.E.0004.02', '20,809,523', '-', '-', '-', '-', '-', '-', '-', '-', '1,980,952', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(233, 1, 33, 'AU.E.0004.05', '15,760,000', '1,200,000', '225,000', '150,000', '2,550,000', '75,000', '450,000', '150,000', '300,000', '121,250', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(234, 1, 34, 'AU.E.0004.05', '19,760,000', '1,520,000', '285,000', '190,000', '3,230,000', '95,000', '570,000', '190,000', '380,000', '350,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(235, 1, 35, 'AU.E.0004.05', '22,800,000', '1,760,000', '330,000', '220,000', '3,740,000', '110,000', '660,000', '220,000', '440,000', '619,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(236, 1, 36, 'AU.E.0004.06', '25,680,000', '2,000,000', '375,000', '250,000', '4,250,000', '125,000', '750,000', '250,000', '500,000', '447,500', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(237, 1, 37, 'AU.E.0004.06', '25,800,000', '2,000,000', '375,000', '250,000', '4,250,000', '125,000', '750,000', '250,000', '500,000', '956,250', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(238, 1, 38, 'AU.E.0004.06', '14,116,364', '-', '-', '-', '-', '-', '-', '-', '-', '1,363,636', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(239, 1, 39, 'AU.E.0004.06', '33,760,000', '2,640,000', '495,000', '330,000', '5,610,000', '165,000', '990,000', '330,000', '660,000', '2,057,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(240, 1, 40, 'AU.E.0004.07', '32,800,000', '2,560,000', '480,000', '320,000', '5,440,000', '160,000', '960,000', '320,000', '640,000', '1,236,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(241, 1, 41, 'AU.E.0004.08', '24,760,000', '1,920,000', '360,000', '240,000', '4,080,000', '120,000', '720,000', '240,000', '480,000', '358,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(242, 1, 42, 'AU.F.0007.02', '24,760,000', '1,920,000', '360,000', '240,000', '4,080,000', '120,000', '720,000', '240,000', '480,000', '84,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(243, 1, 43, 'AU.F.0007.02', '20,800,000', '1,600,000', '300,000', '200,000', '3,400,000', '100,000', '600,000', '200,000', '400,000', '440,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(244, 1, 44, 'AU.Q.0005.04', '27,163,636', '-', '-', '-', '-', '-', '-', '-', '-', '2,636,364', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(245, 1, 45, 'VN.S.0001.05', '22,800,000', '-', '-', '-', '-', '-', '-', '-', '-', '2,200,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(246, 1, 46, 'VN.S.0001.06', '6,643,636', '-', '-', '-', '-', '-', '-', '-', '-', '636,364', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(247, 1, 47, 'VN.S.0001.90', '41,800,000', '3,280,000', '615,000', '410,000', '6,970,000', '205,000', '1,230,000', '410,000', '820,000', '1,124,250', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(248, 1, 48, 'VN.S.0001.90', '32,800,000', '2,560,000', '480,000', '320,000', '5,440,000', '160,000', '960,000', '320,000', '640,000', '1,236,000', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(249, 1, 49, 'VN.S.0001.90', '14,549,091', '-', '-', '-', '-', '-', '-', '-', '-', '1,390,909', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(250, 1, 50, 'VN.S.0001.90', '47,800,000', '3,744,000', '702,000', '470,000', '7,956,000', '234,000', '1,404,000', '470,000', '936,000', '3,686,800', '2026-01-07 18:15:06', '2026-01-07 18:15:06'),
(251, 2, 1, 'VN.S.0001.90', '47760000', '3744000', '702000', '470000', '7956000', '234000', '1404000', '470000', '936000', '2426800', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(252, 2, 2, 'AU.C.0002.06', '82104580', '3256983', '610684', '407123', '6921089', '203561', '1221369', '407123', '814246', '10784937', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(253, 2, 3, 'AU.C.0002.06', '60018868', '2481761', '465330', '310220', '5273743', '155110', '930661', '310220', '620440', '5375389', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(254, 2, 4, 'AU.C.0002.06', '60055050', '2376602', '445613', '297075', '5050279', '148538', '891226', '297075', '594151', '4029152', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(255, 2, 5, 'AU.C.0002.06', '55185000', '2280000', '427500', '285000', '4845000', '142500', '855000', '285000', '570000', '3096500', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(256, 2, 6, 'AU.C.0002.06', '44600000', '1760000', '330000', '220000', '3740000', '110000', '660000', '220000', '440000', '2348000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(257, 2, 7, 'VN.S.0001.90', '64640000', '2560000', '480000', '320000', '5440000', '160000', '960000', '320000', '640000', '6485000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(258, 2, 8, 'AU.C.0003.01', '51265000', '2160000', '405000', '270000', '4590000', '135000', '810000', '270000', '540000', '3568000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(259, 2, 9, 'AU.C.0003.01', '32555000', '1360000', '255000', '170000', '2890000', '85000', '510000', '170000', '340000', '1438500', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(260, 2, 10, 'AU.C.0003.01', '44426087', '1920000', '360000', '240000', '4080000', '120000', '720000', '240000', '480000', '1260913', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(261, 2, 11, 'AU.E.0004.02', '55600000', '2200000', '412500', '275000', '4675000', '137500', '825000', '275000', '550000', '3192500', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(262, 2, 12, 'AU.E.0004.02', '53100000', '2240000', '420000', '280000', '4760000', '140000', '840000', '280000', '560000', '2682000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(263, 2, 13, 'AU.E.0004.06', '47435000', '2000000', '375000', '250000', '4250000', '125000', '750000', '250000', '500000', '4100000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(264, 2, 14, 'AU.E.0004.06', '63730435', '2640000', '495000', '330000', '5610000', '165000', '990000', '330000', '660000', '6241359', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(265, 2, 15, 'VN.S.0001.90', '75966667', '3280000', '615000', '410000', '6970000', '205000', '1230000', '410000', '820000', '5940417', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(266, 2, 16, 'AU.E.0004.07', '62194203', '2720000', '510000', '340000', '5780000', '170000', '1020000', '340000', '680000', '5831051', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(267, 2, 17, 'AU.C.0002.05', '35600000', '1600000', '300000', '200000', '3400000', '100000', '600000', '200000', '400000', '930000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(268, 2, 18, 'AU.E.0004.08', '37382609', '1920000', '360000', '240000', '4080000', '120000', '720000', '240000', '480000', '1134391', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(269, 2, 19, 'AU.E.0004.02', '40770000', '1840000', '345000', '230000', '3910000', '115000', '690000', '230000', '460000', '2817000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(270, 2, 20, 'AU.E.0004.02', '39100000', '1760000', '330000', '220000', '3740000', '110000', '660000', '220000', '440000', '2488000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(271, 2, 21, 'AU.C.0002.06', '27805000', '1240000', '232500', '155000', '2635000', '77500', '465000', '155000', '310000', '749750', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(272, 2, 22, 'AU.C.0002.06', '29435000', '1320000', '247500', '165000', '2805000', '82500', '495000', '165000', '330000', '996375', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(273, 2, 23, 'AU.C.0002.06', '41090000', '1840000', '345000', '230000', '3910000', '115000', '690000', '230000', '460000', '2817000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(274, 2, 24, 'AU.E.0004.02', '34725000', '1560000', '292500', '195000', '3315000', '97500', '585000', '195000', '390000', '1736625', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(275, 2, 25, 'AU.E.0004.05', '31331739', '1520000', '285000', '190000', '3230000', '95000', '570000', '190000', '380000', '1241511', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(276, 2, 26, 'AU.C.0003.04', '30455072', '1600000', '300000', '200000', '3400000', '100000', '600000', '200000', '400000', '-', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(277, 2, 27, 'AU.C.0006.02', '27085507', '1360000', '255000', '170000', '2890000', '85000', '510000', '170000', '340000', '670051', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(278, 2, 28, 'AU.C.0002.06', '27266667', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '164333', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(279, 2, 29, 'AU.F.0007.02', '44600000', '1920000', '360000', '240000', '4080000', '120000', '720000', '240000', '480000', '1287000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(280, 2, 30, 'AU.C.0002.06', '26053333', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '565333', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(281, 2, 31, 'AU.E.0004.05', '23432609', '1296000', '243000', '162000', '2754000', '81000', '486000', '162000', '324000', '-', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(282, 2, 32, 'AU.E.0004.06', '40183333', '2000000', '375000', '250000', '4250000', '125000', '750000', '250000', '500000', '1538750', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(283, 2, 33, 'AU.F.0007.02', '32266667', '1600000', '300000', '200000', '3400000', '100000', '600000', '200000', '400000', '1360000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(284, 2, 34, 'AU.E.0004.05', '34516667', '1760000', '330000', '220000', '3740000', '110000', '660000', '220000', '440000', '1666000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(285, 2, 35, 'AU.C.0002.06', '32273478', '1800000', '337500', '225000', '3825000', '112500', '675000', '225000', '450000', '523098', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(286, 2, 36, 'AU.C.0006.02', '21846377', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '203319', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(287, 2, 37, 'AU.C.0002.06', '23346667', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '298667', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(288, 2, 38, 'AU.C.0002.10', '42730435', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8426087', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(289, 2, 39, 'AU.C.0002.06', '14212664', '768715', '144134', '96089', '1633520', '48045', '288268', '96089', '192179', '-', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(290, 2, 40, 'AU.C.0002.06', '14212664', '768715', '144134', '96089', '1633520', '48045', '288268', '96089', '192179', '-', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(291, 2, 41, 'AU.C.0002.06', '14212664', '768715', '144134', '96089', '1633520', '48045', '288268', '96089', '192179', '-', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(292, 2, 42, 'AU.C.0009.05', '29853623', '1760000', '330000', '220000', '3740000', '110000', '660000', '220000', '440000', '966543', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(293, 2, 43, 'AU.E.0004.02', '23266667', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '298667', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(294, 2, 44, 'VN.S.0001.90', '24560580', '1520000', '285000', '190000', '3230000', '95000', '570000', '190000', '380000', '7279', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(295, 2, 45, 'AU.C.0010.06', '24600000', '1440000', '270000', '180000', '3060000', '90000', '540000', '180000', '360000', '411000', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(296, 2, 46, 'AU.Q.0005.04', '42013333', '2480000', '465000', '310000', '5270000', '155000', '930000', '310000', '620000', '1706750', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(297, 2, 47, 'AU.C.0002.06', '18241869', '1058512', '198471', '132314', '2249338', '66157', '396942', '132314', '264628', '37629', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(298, 2, 48, 'AU.E.0004.06', '29630797', '2000000', '375000', '250000', '4250000', '125000', '750000', '250000', '500000', '885870', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(299, 2, 49, 'AU.C.0009.06', '23860870', '1600000', '300000', '200000', '3400000', '100000', '600000', '200000', '400000', '316087', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(300, 2, 50, 'AU.E.0004.02', '19237681', '1280000', '240000', '160000', '2720000', '80000', '480000', '160000', '320000', '72884', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(301, 2, 51, 'AU.E.0011.04', '18686957', '-', '-', '-', '-', '-', '-', '-', '-', '1808696', '2026-01-07 23:41:23', '2026-01-07 23:41:23'),
(302, 2, 52, 'AU.E.0004.04', '9643478', '-', '-', '-', '-', '-', '-', '-', '-', '904348', '2026-01-07 23:41:23', '2026-01-07 23:41:23');

-- --------------------------------------------------------

--
-- Table structure for table `social_sheets`
--

CREATE TABLE `social_sheets` (
  `sheet_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `rows_json` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_sheets`
--

INSERT INTO `social_sheets` (`sheet_id`, `name`, `start_date`, `end_date`, `rows_json`, `created_at`, `updated_at`) VALUES
(1, 'Social Sheet 1/5/2026', NULL, NULL, '[{\"id\":1,\"date\":\"30/12/25\",\"worker_name\":\"Marley Smith\",\"number_of_participants\":\"1\",\"participant_1\":\"Callan White\",\"shift_starts\":\"13:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Picked up from flynn ward to go to bank , get smokes and shopping and a bit of fresh air\"},{\"id\":2,\"date\":\"30/12/25\",\"worker_name\":\"Marley Smith\",\"number_of_participants\":\"1\",\"participant_1\":\"Glen Mackay\",\"shift_starts\":\"11:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Washington St appointment\"},{\"id\":3,\"date\":\"30/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Rosemary Hiskins\",\"shift_starts\":\"13:00\",\"shift_ends\":\"16:00\",\"actual_hours\":\"3\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"8\",\"details_of_activity\":\"\\\"We went to the cat cafe today but it was closed so we went down the street and had a cuppa.\"},{\"id\":4,\"date\":\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":5,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Miriam Withers\",\"shift_starts\":\"14:30\",\"shift_ends\":\"16:00\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having afternoon tea and chatting. Helping with personal hygiene. Phsio workout and went for a walk.\"},{\"id\":6,\"date\":\"30/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"14:45\",\"shift_ends\":\"15:15\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"2\",\"details_of_activity\":\"pick up Dallas from c2a op shop then back to Glenwood\"},{\"id\":7,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Lena Geisheimer\",\"shift_starts\":\"13:00\",\"shift_ends\":\"14:30\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood doing her puzzle. Changed her bedding.\"},{\"id\":8,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"12:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting with cutting his food for lunch and sat with him.\"},{\"id\":9,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Lena Geisheimer\",\"shift_starts\":\"09:30\",\"shift_ends\":\"12:00\",\"actual_hours\":\"2.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Morning tea and chatting. Doing her nails.\"},{\"id\":10,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"09:00\",\"shift_ends\":\"09:30\",\"actual_hours\":\"0.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Dropped off at C2A op shop in Traralgon.\"},{\"id\":11,\"date\":\"30/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting him with breakfast. Massaged his legs and feet.\"},{\"id\":12,\"date\":\"29/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"14:45\",\"shift_ends\":\"15:15\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"2\",\"details_of_activity\":\"picked up dallas from c2a op shop then back to Glenwoood\"},{\"id\":13,\"date\":\"29/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Jessica Beasley\",\"shift_starts\":\"18:00\",\"shift_ends\":\"19:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"resident cancelled\"},{\"id\":14,\"date\":\"29/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Rosemary Hiskins\",\"shift_starts\":\"16:00\",\"shift_ends\":\"20:00\",\"actual_hours\":\"4\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"\\\"When I arrived at Lochpark today, Rosie was on the couch asleep. I tried to wake her up to ask her if she wanted to go out for tea as she said that she would like to go out for tea yesterday when I called to ask her.\"},{\"id\":15,\"date\":\"I stayed there for an hour, trying to wake her up, but she would not wake up.\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":16,\"date\":\"29/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Amber Daymond\",\"shift_starts\":\"15:00\",\"shift_ends\":\"16:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"4\",\"details_of_activity\":\"\\\"I took Amber down the street to the bank\"},{\"id\":17,\"date\":\"Her money was not in yet it will be in at 5 pm\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":18,\"date\":\"29/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Paul Maguire\",\"shift_starts\":\"11:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"4\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"9\",\"details_of_activity\":\"\\\"We went down the street and had a cuppa\"},{\"id\":19,\"date\":\"Paul had a pie for lunch\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":20,\"date\":\"We then went to the Grand Junction\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":21,\"date\":\"I then took him food shopping\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":22,\"date\":\"29/12/25\",\"worker_name\":\"Marley Smith\",\"number_of_participants\":\"1\",\"participant_1\":\"Charlie Robinson\",\"shift_starts\":\"13:30\",\"shift_ends\":\"15:30\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Got asked to take Charlie out , he needed support\"},{\"id\":23,\"date\":\"29/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"14:30\",\"shift_ends\":\"16:00\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having afternoon tea and chatting. Helping sort all her containers.\"},{\"id\":24,\"date\":\"29/12/25\",\"worker_name\":\"Marley Smith\",\"number_of_participants\":\"1\",\"participant_1\":\"Glen Mackay\",\"shift_starts\":\"10:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"3\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"70\",\"details_of_activity\":\"Glen had a bloodtest then wanted to go bank and shopping then wanted to go for a drive to old gipps town for lunch\"},{\"id\":25,\"date\":\"29/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Cheryl-Anne Croydon\",\"shift_starts\":\"11:30\",\"shift_ends\":\"14:30\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Traralgon McDonalds for lunch. Help set up and play bingo. Traralgon Dorevitch for her blood tests.\"},{\"id\":26,\"date\":\"29/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Shelly Matthews\",\"shift_starts\":\"09:30\",\"shift_ends\":\"11:30\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Morning tea and chatting.\"},{\"id\":27,\"date\":\"29/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"09:00\",\"shift_ends\":\"09:30\",\"actual_hours\":\"0.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Dropped off at C2A op shop for the day.\"},{\"id\":28,\"date\":\"29/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting him with breakfast. Massaged his legs and feet.\"},{\"id\":29,\"date\":\"28/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Looked after John for the day, made breakfast and coffee, watched tv, had a chat, tidied room, assisted PCA with changing John and clean linen, removed dirty laundry, put away clean laundry.\"},{\"id\":30,\"date\":\"27/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"09:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"3\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"48\",\"details_of_activity\":\"Drive to Rosedale, Rosedale Bakery, Newman Park Traralgon, walk, listened to music.\"},{\"id\":31,\"date\":\"27/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Made John breakfast and coffee, watched tv, chatted, tidied room.\"},{\"id\":32,\"date\":\"24/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Callan White\",\"shift_starts\":\"11:15\",\"shift_ends\":\"13:15\",\"actual_hours\":\"2\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"48\",\"details_of_activity\":\"Picked up Callan from LRH, went for a drive to Moe, Smokes.\"},{\"id\":33,\"date\":\"24/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"11:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Made John breakfast and coffee, had a chat, watched some tv, tidied johns room, topped up wardrobe with linen, John had a sleep.\"},{\"id\":34,\"date\":\"24/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"10:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having morning tea and chatting. Helping sort her wardrobe and clothes. Having lunch.\"},{\"id\":35,\"date\":\"24/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Paul Maguire\",\"shift_starts\":\"11:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"4\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"29\",\"details_of_activity\":\"\\\"I took Paul out for a cuppa down the street after that we went to the Glen Pub\"},{\"id\":36,\"date\":\"I then took Paul food shopping and returned him to Glenwood\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":37,\"date\":\"24/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"11:30\",\"shift_ends\":\"12:00\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"picked up Dallas from op shop\"},{\"id\":38,\"date\":\"24/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Lena Geisheimer\",\"shift_starts\":\"08:00\",\"shift_ends\":\"10:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having breakfast and chatting. Doing her Xmas nails.\"},{\"id\":39,\"date\":\"24/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"got dallas organized for group and dropped him off\"},{\"id\":40,\"date\":\"23/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Rosemary Hiskins\",\"shift_starts\":\"13:00\",\"shift_ends\":\"16:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"\\\"Rosie was in the shower when I arrived today.\"},{\"id\":41,\"date\":\"We went down the street and had a cuppa and went for a walk around the shops. Then we went to the market to have a look.\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":42,\"date\":\"I then left Rosie down the street as requested from her.\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":43,\"date\":\"23/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Shelly Matthews\",\"shift_starts\":\"15:00\",\"shift_ends\":\"16:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having afternoon tea and chatting. Helping clean and sort her cane baskets.\"},{\"id\":44,\"date\":\"23/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"14:45\",\"shift_ends\":\"15:15\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"2\",\"details_of_activity\":\"picked up Dallas from group and took him back to Glenwood\"},{\"id\":45,\"date\":\"23/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Cheryl-Anne Croydon\",\"shift_starts\":\"13:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping set up and play bingo. Afternoon tea and chatting.\"},{\"id\":46,\"date\":\"23/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"12:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting him with cutting his food for lunch and sat with him.\"},{\"id\":47,\"date\":\"23/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"09:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her bathroom and vacuum her room. Morning tea and chatting. Doing crafts.\"},{\"id\":48,\"date\":\"23/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"got Dallas organized and dropped him off at group\"},{\"id\":49,\"date\":\"23/12/25\",\"worker_name\":\"Serina angus\",\"number_of_participants\":\"1\",\"participant_1\":\"Sherraden Crane\",\"shift_starts\":\"09:30\",\"shift_ends\":\"12:30\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Craft and cleaned room\"},{\"id\":50,\"date\":\"23/12/25\",\"worker_name\":\"Serina angus\",\"number_of_participants\":\"1\",\"participant_1\":\"Miriam Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:30\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Cleaned room and craft\"},{\"id\":51,\"date\":\"23/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting him with breakfast. Massaged his legs and feet.\"},{\"id\":52,\"date\":\"22/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Jessica Beasley\",\"shift_starts\":\"18:00\",\"shift_ends\":\"19:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"cancelled by resident\"},{\"id\":53,\"date\":\"22/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Shelly Matthews\",\"shift_starts\":\"14:00\",\"shift_ends\":\"16:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Afternoon tea and chatting. Changed her bedding.\"},{\"id\":54,\"date\":\"22/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Rosemary Hiskins\",\"shift_starts\":\"10:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"\\\"Rosie was in her pjs when I arrived this morning\"},{\"id\":55,\"date\":\"She then had a shower and got ready to go down the street\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":56,\"date\":\"We went for a walk around town then went back to LP\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":57,\"date\":\"She had some lunch and we sat outside\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":58,\"date\":\"22/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"14:45\",\"shift_ends\":\"15:15\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"2\",\"details_of_activity\":\"picked up Dallas from group then took him back to Glenwood\"},{\"id\":59,\"date\":\"22/12/25\",\"worker_name\":\"Tracey fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Amber Daymond\",\"shift_starts\":\"13:00\",\"shift_ends\":\"13:30\",\"actual_hours\":\"0.5\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"4\",\"details_of_activity\":\"took Amber to bendigo bank traralgon then back to Glenwood\"},{\"id\":60,\"date\":\"22/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Cheryl-Anne Croydon\",\"shift_starts\":\"12:00\",\"shift_ends\":\"14:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Traralgon Hungry Jacks to get lunch. Glenwood helping clean her room/bathroom and vacuum. Changed her bedding.\"},{\"id\":61,\"date\":\"22/12/25\",\"worker_name\":\"Marley Smith\",\"number_of_participants\":\"1\",\"participant_1\":\"Glen Mackay\",\"shift_starts\":\"12:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Took Glen to get what he needed and money from bank and lunch\"},{\"id\":62,\"date\":\"22/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"09:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Morning tea and chatting. Colouring in.\"},{\"id\":63,\"date\":\"22/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting him with breakfast. Helped slide sheet him and changed his bedding and clothes.\"},{\"id\":64,\"date\":\"22/12/25\",\"worker_name\":\"Serina angus\",\"number_of_participants\":\"1\",\"participant_1\":\"Sherraden Crane\",\"shift_starts\":\"11:00\",\"shift_ends\":\"14:00\",\"actual_hours\":\"3\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"6\",\"details_of_activity\":\"Went to bank. Then had lunch. Then done some shopping.\"},{\"id\":65,\"date\":\"22/12/25\",\"worker_name\":\"Serina angus\",\"number_of_participants\":\"1\",\"participant_1\":\"Miriam Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"11:00\",\"actual_hours\":\"3\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"6\",\"details_of_activity\":\"Lifeline,coffee then some shopping\"},{\"id\":66,\"date\":\"22/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"got Dallas organized for group and dropped him off\"},{\"id\":67,\"date\":\"21/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"4\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"looked after John, made him break & coffee, lunch, watched tv, chatted,  topped up his wardrobe with linen, cleaned toilet, tied room,  made sure John was comfortable in his bed.\"},{\"id\":68,\"date\":\"19/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"got organized for group and dropped him off\"},{\"id\":69,\"date\":\"19/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Charlie Robinson\",\"shift_starts\":\"09:30\",\"shift_ends\":\"12:00\",\"actual_hours\":\"2.5\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"5\",\"details_of_activity\":\"NAB Bank Traralgon, Smokes, Newman Park Traralgon, walk, listened to music, hung out with friends at Glenwood.\"},{\"id\":70,\"date\":\"19/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Made John breakfast and coffee, chatted, tidied room.\"},{\"id\":71,\"date\":\"19/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"12:30\",\"shift_ends\":\"14:30\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having lunch and chatting. Helping clean her room and vacuum.\"},{\"id\":72,\"date\":\"19/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Miriam Withers\",\"shift_starts\":\"11:00\",\"shift_ends\":\"12:30\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping with personal hygiene. Phsio workout and went for a walk.\"},{\"id\":73,\"date\":\"19/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"\\\"Lena Geisheimer\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":74,\"date\":\"Cheryl-Anne Croydon\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":75,\"date\":\"Miriam Withers\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":76,\"date\":\"Charlie Robinson\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":77,\"date\":\"Patricia Webb\\\"\",\"worker_name\":\"10:00\",\"number_of_participants\":\"11:00\",\"participant_1\":\"1\",\"shift_starts\":\"NO\",\"shift_ends\":\"0\",\"actual_hours\":\"Glenwood Group Activities painting Xmas nails.\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":78,\"date\":\"19/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Lena Geisheimer\",\"shift_starts\":\"08:00\",\"shift_ends\":\"10:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping clean her room/bathroom and vacuum. Clean her kitty litter. Changed her bedding.\"},{\"id\":79,\"date\":\"18/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"amber daymond\",\"shift_starts\":\"15:00\",\"shift_ends\":\"16:30\",\"actual_hours\":\"1.5\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Traralgon Bendigo Bank to get her money out. Mercy Clinic for her doctors appointment.\"},{\"id\":80,\"date\":\"18/12/25\",\"worker_name\":\"Karen Byatt\",\"number_of_participants\":\"1\",\"participant_1\":\"Dallas Withers\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"5\",\"details_of_activity\":\"got dallas ready for group and dropped him off\"},{\"id\":81,\"date\":\"18/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"\\\"Dallas Withers\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":82,\"date\":\"Miriam Withers\\\"\",\"worker_name\":\"14:45\",\"number_of_participants\":\"17:30\",\"participant_1\":\"2.75\",\"shift_starts\":\"YES - Return Trip\",\"shift_ends\":\"4\",\"actual_hours\":\"took Mirriam to pick up dallas from group then to coles traralgon village, Gloria Jeans Traralgon for a cold drink\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":83,\"date\":\"18/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Sherraden Crane\",\"shift_starts\":\"13:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"2\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"2\",\"details_of_activity\":\"we went to woolworths for a few things then back to Glenwood\"},{\"id\":84,\"date\":\"18/12/25\",\"worker_name\":\"Tracey Fox\",\"number_of_participants\":\"1\",\"participant_1\":\"Mark Kelly\",\"shift_starts\":\"09:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"4\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"3\",\"details_of_activity\":\"went to the plaza traralgon then walked around shopping centre then lunch at the food court\"},{\"id\":85,\"date\":\"18/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Paul Maguire\",\"shift_starts\":\"11:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Stayed in, had some great conversations.\"},{\"id\":86,\"date\":\"18/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"13:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping rearrange her room. Afternoon tea and chatting.\"},{\"id\":87,\"date\":\"18/12/25\",\"worker_name\":\"Tania Bodley\",\"number_of_participants\":\"1\",\"participant_1\":\"Rosemary Hiskins\",\"shift_starts\":\"11:15\",\"shift_ends\":\"15:15\",\"actual_hours\":\"4\",\"use_own_car\":\"YES - One Way\",\"total_mileage\":\"20\",\"details_of_activity\":\"\\\"When I arrive today at Lochpark Rosie was eating some breakfast.\"},{\"id\":88,\"date\":\"After that, she went and had a shower. Then we sat outside and had a cuppa.\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":89,\"date\":\"Rosemary had a doctors appointment for her blood letting at Latrobe regional hospital today.\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":90,\"date\":\"They asked if I could get her a dietician appointment.\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":91,\"date\":\"We then went down the street and had a cuppa after that we went back to Lochpark\\\"\",\"worker_name\":\"\",\"number_of_participants\":\"\",\"participant_1\":\"\",\"shift_starts\":\"\",\"shift_ends\":\"\",\"actual_hours\":\"\",\"use_own_car\":\"\",\"total_mileage\":\"\",\"details_of_activity\":\"\"},{\"id\":92,\"date\":\"18/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"12:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood supporting with cutting his food for lunch and sat with him.\"},{\"id\":93,\"date\":\"18/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Glen Mackay\",\"shift_starts\":\"09:00\",\"shift_ends\":\"11:00\",\"actual_hours\":\"2\",\"use_own_car\":\"YES - Return Trip\",\"total_mileage\":\"22\",\"details_of_activity\":\"Commonwealth Bank Traralgon, Smokes, drive to Glengarry, sat at the park, chatted.\"},{\"id\":94,\"date\":\"18/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"09:00\",\"shift_ends\":\"12:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood doing crafts. Having morning tea and chatting. Colouring in.\"},{\"id\":95,\"date\":\"18/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Shelly Matthews\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having breakfast and chatting. Helped make her bed and put her washing away.\"},{\"id\":96,\"date\":\"18/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"08:00\",\"shift_ends\":\"09:00\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Made John breakfast and coffee, had a chat.\"},{\"id\":97,\"date\":\"18/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"Callan White\",\"shift_starts\":\"12:15\",\"shift_ends\":\"13:15\",\"actual_hours\":\"1\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Went to visit Callan at LRH and see how he was going.\"},{\"id\":98,\"date\":\"17/12/25\",\"worker_name\":\"Vince Licciardi\",\"number_of_participants\":\"1\",\"participant_1\":\"John O\'Rourke\",\"shift_starts\":\"09:00\",\"shift_ends\":\"11:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"John was awake after breakfast, had a chat then John went back to sleep, tidied room.\"},{\"id\":99,\"date\":\"17/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Cheryl-Anne Croydon\",\"shift_starts\":\"13:00\",\"shift_ends\":\"15:00\",\"actual_hours\":\"2\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood helping sort all of her clothes. Afternoon tea and chatting.\"},{\"id\":100,\"date\":\"17/12/25\",\"worker_name\":\"Barbara Crawford\",\"number_of_participants\":\"1\",\"participant_1\":\"Mary O\'Neill\",\"shift_starts\":\"10:00\",\"shift_ends\":\"13:00\",\"actual_hours\":\"3\",\"use_own_car\":\"NO\",\"total_mileage\":\"0\",\"details_of_activity\":\"Glenwood having morning tea and chatting. Helping clean her bathroom and vacuum. Having Xmas lunch.\"}]', '2026-01-05 15:04:31', '2026-01-05 15:04:31');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `task_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','inprogress','review','done') DEFAULT 'todo',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attachment_url` varchar(500) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`task_id`, `title`, `description`, `status`, `priority`, `due_date`, `assigned_to`, `position`, `created_at`, `updated_at`, `attachment_url`, `attachment_name`) VALUES
(1, 'thanh toán hóa đơn', 'cho jerry', 'todo', 'medium', '2026-01-15', NULL, 0, '2026-01-09 15:52:49', '2026-01-09 15:54:03', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `timesheetreport`
--

CREATE TABLE `timesheetreport` (
  `report_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `num_days` int(11) NOT NULL,
  `num_rows` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `processed_data` longtext DEFAULT NULL,
  `date_headers` longtext DEFAULT NULL
) ;

--
-- Dumping data for table `timesheetreport`
--

INSERT INTO `timesheetreport` (`report_id`, `start_date`, `num_days`, `num_rows`, `name`, `created_at`, `updated_at`, `processed_data`, `date_headers`) VALUES
(6, '2025-12-17', 14, 40, 'TimeSheet 17/12 - 30/12', '2026-01-02 11:37:08', '2026-01-08 17:30:12', '[{\"name\":\"Ange\",\"jobs\":[{\"num\":1,\"note\":\"Manager\",\"period\":\"7:30am-4pm\",\"hrsValue\":\"7.5\",\"workedDays\":{\"0\":true,\"1\":true,\"2\":true,\"5\":true,\"6\":true,\"7\":true,\"8\":true,\"9\":true,\"12\":true,\"13\":true},\"dayValues\":[\"7.5\",\"7.5\",\"7.5\",\"\",\"\",\"7.5\",\"7.5\",\"7.5\",\"7.5\",\"7.5\",\"\",\"\",\"7.5\",\"7.5\"],\"full_name\":\" Angela Smith\",\"level\":\"HC Level 4 CA/Fix Sal Bonus EOM\"}]},{\"name\":\"Ash S\",\"jobs\":[{\"num\":2,\"note\":\"PC1/clean\",\"period\":\"7am-3:30pm\",\"hrsValue\":\"7.5\",\"workedDays\":{\"2\":true,\"6\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"7.5\",\"\",\"\",\"\",\"7.5\",\"\",\"\",\"\",\"\",\"\",\"\",\"7.5\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":3,\"note\":\"PC2/clean\",\"period\":\"8am-1pm\",\"hrsValue\":\"5\",\"workedDays\":{\"8\":true,\"9\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"5\",\"5\",\"\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":4,\"note\":\"PC3/clean\",\"period\":\"3:15pm-7:30pm\",\"hrsValue\":\"4.25\",\"workedDays\":{\"0\":true},\"dayValues\":[\"4.25\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":16,\"note\":\"pc7\",\"period\":\"8.30am-3pm\",\"hrsValue\":\"5.5\",\"workedDays\":{\"3\":true},\"dayValues\":[\"\",\"\",\"\",\"5.5\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":17,\"note\":\"pc8\",\"period\":\"3pm-7pm\",\"hrsValue\":\"4\",\"workedDays\":{\"4\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":19,\"note\":\"S/O-PC\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"10\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":20,\"note\":\"s/o\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"10\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":21,\"note\":\"PC/Clean\",\"period\":\"7AM-8:30AM\",\"hrsValue\":\"1.5\",\"workedDays\":{\"10\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1.5\",\"\",\"\",\"\"],\"full_name\":\" Aswini Sethunathan\",\"level\":\"HC Level 2 FT/PT\"}]},{\"name\":\"Barb M\",\"jobs\":[{\"num\":31,\"note\":\"K-hand\",\"period\":\"11am-1:30pm\",\"hrsValue\":\"2.5\",\"workedDays\":{\"0\":true,\"1\":true,\"2\":true,\"6\":true,\"7\":true,\"8\":true,\"9\":true,\"13\":true},\"dayValues\":[\"2.5\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"2.5\",\"2.5\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"2.5\"],\"full_name\":\"  Barbara Crawford\",\"level\":\"HC Level 2 CA\"},{\"num\":34,\"note\":\"k-Hand\",\"period\":\"11am-1:30pm\",\"hrsValue\":\"2.5\",\"workedDays\":{\"3\":true,\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"\",\"\",\"2.5\",\"2.5\",\"\",\"\"],\"full_name\":\"  Barbara Crawford\",\"level\":\"HC Level 2 CA\"}]},{\"name\":\"Brian\",\"jobs\":[{\"num\":4,\"note\":\"PC3/clean\",\"period\":\"3:15pm-7:30pm\",\"hrsValue\":\"4.25\",\"workedDays\":{\"8\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"4.25\",\"\",\"\",\"\",\"\",\"\"]},{\"num\":5,\"note\":\"PCA/Extra\",\"period\":\"4pm-6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"6\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"2\"]}]},{\"name\":\"Carolyn\",\"jobs\":[{\"num\":30,\"note\":\"Cook\",\"period\":\"7:30am-1pm\",\"hrsValue\":\"5.5\",\"workedDays\":{\"0\":true,\"1\":true,\"2\":true,\"6\":true,\"7\":true,\"8\":true,\"9\":true,\"13\":true},\"dayValues\":[\"5.5\",\"5.5\",\"5.5\",\"\",\"\",\"\",\"5.5\",\"5.5\",\"5.5\",\"5.5\",\"\",\"\",\"\",\"5.5\"],\"full_name\":\" Carolyn Wigg\",\"level\":\"HC Level 3 CA\"}]},{\"name\":\"Daved\",\"jobs\":[{\"num\":5,\"note\":\"PCA/Extra\",\"period\":\"4pm-6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"2\":true,\"9\":true},\"dayValues\":[\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\"],\"full_name\":\" Daved Penfold\",\"level\":\"HC Level 1 CA\"},{\"num\":6,\"note\":\"PC4/Night\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"0\":true,\"7\":true},\"dayValues\":[\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Daved Penfold\",\"level\":\"HC Level 1 CA\"},{\"num\":7,\"note\":\"PC4/SO\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"0\":true,\"7\":true},\"dayValues\":[\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Daved Penfold\",\"level\":\"HC Level 1 CA\"},{\"num\":8,\"note\":\"PC4/\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"0\":true,\"7\":true},\"dayValues\":[\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Daved Penfold\",\"level\":\"HC Level 1 CA\"},{\"num\":18,\"note\":\"PCA/Extra\",\"period\":\"4pm - 6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"3\":true},\"dayValues\":[\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Daved Penfold\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Jennifer\",\"jobs\":[{\"num\":9,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"1\":true,\"5\":true,\"6\":true,\"8\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"3\",\"\",\"\",\"\",\"3\",\"3\",\"\",\"3\",\"\",\"\",\"\",\"3\",\"3\"],\"full_name\":\" Jennifer Bell\",\"level\":\"HC Level 1 CA\"},{\"num\":10,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"1\":true,\"5\":true,\"6\":true,\"8\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"1\",\"\",\"\",\"\",\"1\",\"1\",\"\",\"1\",\"\",\"\",\"\",\"1\",\"1\"],\"full_name\":\" Jennifer Bell\",\"level\":\"HC Level 1 CA\"},{\"num\":11,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"1\":true,\"5\":true,\"6\":true,\"8\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"1\",\"\",\"\",\"\",\"1\",\"1\",\"\",\"1\",\"\",\"\",\"\",\"1\",\"1\"],\"full_name\":\" Jennifer Bell\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Jim\",\"jobs\":[{\"num\":29,\"note\":\"Maintenance\",\"period\":\"10am - 3pm\",\"hrsValue\":\"5\",\"workedDays\":{\"0\":true,\"2\":true,\"6\":true,\"12\":true},\"dayValues\":[\"5\",\"\",\"5\",\"\",\"\",\"\",\"5\",\"\",\"\",\"\",\"\",\"\",\"5\",\"\"],\"full_name\":\" James Smith\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Joshua\",\"jobs\":[{\"num\":9,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"9\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"3\",\"\",\"\",\"\",\"\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"},{\"num\":10,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"9\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"},{\"num\":11,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"9\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"},{\"num\":27,\"note\":\"Laundry\",\"period\":\"9:30am - 3:30pm\",\"hrsValue\":\"6\",\"workedDays\":{\"1\":true},\"dayValues\":[\"\",\"6\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"},{\"num\":28,\"note\":\"Laundry\",\"period\":\"1pm - 3pm\",\"hrsValue\":\"2\",\"workedDays\":{\"0\":true,\"2\":true,\"5\":true,\"6\":true,\"7\":true,\"12\":true,\"13\":true},\"dayValues\":[\"2\",\"\",\"2\",\"\",\"\",\"2\",\"2\",\"2\",\"\",\"\",\"\",\"\",\"2\",\"2\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"},{\"num\":31,\"note\":\"K-hand\",\"period\":\"11am-1:30pm\",\"hrsValue\":\"2.5\",\"workedDays\":{\"5\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"2.5\",\"\",\"\",\"\",\"\",\"\",\"\",\"2.5\",\"\"],\"full_name\":\" Joshua Peillon\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Justin\",\"jobs\":[{\"num\":5,\"note\":\"PCA/Extra\",\"period\":\"4pm-6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"5\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"},{\"num\":9,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"0\":true},\"dayValues\":[\"3\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"},{\"num\":10,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"0\":true},\"dayValues\":[\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"},{\"num\":11,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"0\":true},\"dayValues\":[\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"},{\"num\":30,\"note\":\"Cook\",\"period\":\"7:30am-1pm\",\"hrsValue\":\"5.5\",\"workedDays\":{\"5\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"5.5\",\"\",\"\",\"\",\"\",\"\",\"\",\"5.5\",\"\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"},{\"num\":32,\"note\":\"pc-Tea Cook\",\"period\":\"4pm-6:30pm\",\"hrsValue\":\"2.5\",\"workedDays\":{\"1\":true,\"2\":true,\"8\":true,\"9\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"\",\"\",\"2.5\",\"2.5\",\"\",\"\",\"2.5\",\"2.5\"],\"full_name\":\" Justin Watson\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Karen\",\"jobs\":[{\"num\":26,\"note\":\"Cleaning\",\"period\":\"9am - 4pm\",\"hrsValue\":\"6\",\"workedDays\":{\"0\":true,\"1\":true,\"2\":true,\"5\":true,\"6\":true,\"7\":true},\"dayValues\":[\"6\",\"6\",\"6\",\"\",\"\",\"6\",\"6\",\"6\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Karen Marie Byatt\",\"level\":\"HC Level 2 CA\"}]},{\"name\":\"Kerry\",\"jobs\":[{\"num\":6,\"note\":\"PC4/Night\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"6\":true,\"8\":true,\"9\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"4\",\"4\",\"\",\"\",\"\",\"4\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"},{\"num\":7,\"note\":\"PC4/SO\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"6\":true,\"8\":true,\"9\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"1\",\"1\",\"\",\"\",\"\",\"1\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"},{\"num\":8,\"note\":\"PC4/\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"6\":true,\"8\":true,\"9\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"1\",\"1\",\"\",\"\",\"\",\"1\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"},{\"num\":19,\"note\":\"S/O-PC\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"3\":true,\"4\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"4\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"},{\"num\":20,\"note\":\"s/o\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"3\":true,\"4\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"1\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"},{\"num\":21,\"note\":\"PC/Clean\",\"period\":\"7AM-8:30AM\",\"hrsValue\":\"1.5\",\"workedDays\":{\"3\":true,\"4\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"1.5\",\"1.5\",\"\",\"\",\"\",\"\",\"\",\"\",\"1.5\",\"\",\"\"],\"full_name\":\" Kerry Hammer\",\"level\":\"HC Level 4 CA\"}]},{\"name\":\"Liana\",\"jobs\":[{\"num\":6,\"note\":\"PC4/Night\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"1\":true},\"dayValues\":[\"\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":7,\"note\":\"PC4/SO\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"1\":true},\"dayValues\":[\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":8,\"note\":\"PC4/\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"1\":true},\"dayValues\":[\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":9,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"2\":true},\"dayValues\":[\"\",\"\",\"3\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":10,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"2\":true},\"dayValues\":[\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":11,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"2\":true},\"dayValues\":[\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":22,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"3\":true,\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"3\",\"3\",\"\",\"\",\"\",\"\",\"\",\"3\",\"3\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":23,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"3\":true,\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"1\",\"1\",\"\",\"\",\"\",\"\",\"\",\"1\",\"1\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"},{\"num\":24,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\"],\"full_name\":\" Liana Gustiantoro\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Manu\",\"jobs\":[{\"num\":4,\"note\":\"PC3/clean\",\"period\":\"3:15pm-7:30pm\",\"hrsValue\":\"4.25\",\"workedDays\":{\"1\":true,\"2\":true,\"5\":true,\"6\":true,\"7\":true,\"9\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"4.25\",\"4.25\",\"\",\"\",\"4.25\",\"4.25\",\"4.25\",\"\",\"4.25\",\"\",\"\",\"4.25\",\"4.25\"],\"full_name\":\" Manu Babu\",\"level\":\"HC Level 1 CA\"},{\"num\":17,\"note\":\"pc8\",\"period\":\"3pm-7pm\",\"hrsValue\":\"4\",\"workedDays\":{\"3\":true},\"dayValues\":[\"\",\"\",\"\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Manu Babu\",\"level\":\"HC Level 1 CA\"},{\"num\":18,\"note\":\"PCA/Extra\",\"period\":\"4pm - 6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"4\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Manu Babu\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Maureen\",\"jobs\":[{\"num\":12,\"note\":\"Nurse\",\"period\":\"10am - 3pm\",\"hrsValue\":\"5\",\"workedDays\":{\"1\":true,\"2\":true,\"5\":true,\"6\":true,\"12\":true,\"13\":true},\"dayValues\":[\"\",\"5\",\"5\",\"\",\"\",\"5\",\"5\",\"\",\"\",\"\",\"\",\"\",\"5\",\"5\"],\"full_name\":\" Maureen Grech\",\"level\":\"Lvl 1 EN Casual\"}]},{\"name\":\"Patricia\",\"jobs\":[{\"num\":2,\"note\":\"PC1/clean\",\"period\":\"7am-3:30pm\",\"hrsValue\":\"7.5\",\"workedDays\":{\"0\":true,\"1\":true,\"7\":true,\"8\":true},\"dayValues\":[\"7.5\",\"7.5\",\"\",\"\",\"\",\"\",\"\",\"7.5\",\"7.5\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Patricia Robinson\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":6,\"note\":\"PC4/Night\",\"period\":\"5pm-9pm\",\"hrsValue\":\"4\",\"workedDays\":{\"2\":true,\"5\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"4\",\"\",\"\",\"4\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\"],\"full_name\":\" Patricia Robinson\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":7,\"note\":\"PC4/SO\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"2\":true,\"5\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"1\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\"],\"full_name\":\" Patricia Robinson\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":8,\"note\":\"PC4/\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"2\":true,\"5\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"1\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\"],\"full_name\":\" Patricia Robinson\",\"level\":\"HC Level 2 FT/PT\"},{\"num\":15,\"note\":\"pc6/Clean\",\"period\":\"7am-4pm\",\"hrsValue\":\"8\",\"workedDays\":{\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"8\",\"8\",\"\",\"\"],\"full_name\":\" Patricia Robinson\",\"level\":\"HC Level 2 FT/PT\"}]},{\"name\":\"Serina\",\"jobs\":[{\"num\":32,\"note\":\"pc-Tea Cook\",\"period\":\"4pm-6:30pm\",\"hrsValue\":\"2.5\",\"workedDays\":{\"0\":true,\"5\":true,\"6\":true,\"7\":true},\"dayValues\":[\"2.5\",\"\",\"\",\"\",\"\",\"2.5\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Serina Angus\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Shontai\",\"jobs\":[{\"num\":2,\"note\":\"PC1/clean\",\"period\":\"7am-3:30pm\",\"hrsValue\":\"7.5\",\"workedDays\":{\"5\":true,\"9\":true,\"12\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"7.5\",\"\",\"\",\"\",\"7.5\",\"\",\"\",\"7.5\",\"\"],\"full_name\":\" Shontai Farrell\",\"level\":\"HC Level 4 FT/PT\"},{\"num\":15,\"note\":\"pc6/Clean\",\"period\":\"7am-4pm\",\"hrsValue\":\"8\",\"workedDays\":{\"3\":true,\"4\":true},\"dayValues\":[\"\",\"\",\"\",\"8\",\"8\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Shontai Farrell\",\"level\":\"HC Level 4 FT/PT\"}]},{\"name\":\"Tania\",\"jobs\":[{\"num\":3,\"note\":\"PC2/clean\",\"period\":\"8am-1pm\",\"hrsValue\":\"5\",\"workedDays\":{\"2\":true,\"6\":true,\"13\":true},\"dayValues\":[\"\",\"\",\"5\",\"\",\"\",\"\",\"5\",\"\",\"\",\"\",\"\",\"\",\"\",\"5\"],\"full_name\":\" Tiarna Angus\",\"level\":\"HC Level 2 FT/PT\"}]},{\"name\":\"Tash\",\"jobs\":[{\"num\":33,\"note\":\"Cook\",\"period\":\"7:30am-1:30pm\",\"hrsValue\":\"6\",\"workedDays\":{\"3\":true,\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"6\",\"6\",\"\",\"\",\"\",\"\",\"\",\"6\",\"6\",\"\",\"\"],\"full_name\":\" Faleseu Muliaga\",\"level\":\"HC Level 1 CA\"},{\"num\":35,\"note\":\"Tea cook\",\"period\":\"4pm-6:30PM\",\"hrsValue\":\"2.5\",\"workedDays\":{\"3\":true,\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"2.5\",\"2.5\",\"\",\"\",\"\",\"\",\"\",\"2.5\",\"2.5\",\"\",\"\"],\"full_name\":\" Faleseu Muliaga\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Thuong\",\"jobs\":[{\"num\":3,\"note\":\"PC2/clean\",\"period\":\"8am-1pm\",\"hrsValue\":\"5\",\"workedDays\":{\"1\":true},\"dayValues\":[\"\",\"5\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Thuong Nguyen\",\"level\":\"HC Level 1 CA\"},{\"num\":16,\"note\":\"pc7\",\"period\":\"8.30am-3pm\",\"hrsValue\":\"5.5\",\"workedDays\":{\"4\":true,\"10\":true,\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"5.5\",\"\",\"\",\"\",\"\",\"\",\"5.5\",\"5.5\",\"\",\"\"],\"full_name\":\" Thuong Nguyen\",\"level\":\"HC Level 1 CA\"},{\"num\":17,\"note\":\"pc8\",\"period\":\"3pm-7pm\",\"hrsValue\":\"4\",\"workedDays\":{\"10\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"4\",\"\",\"\",\"\"],\"full_name\":\" Thuong Nguyen\",\"level\":\"HC Level 1 CA\"},{\"num\":18,\"note\":\"PCA/Extra\",\"period\":\"4pm - 6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"11\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"2\",\"\",\"\"],\"full_name\":\" Thuong Nguyen\",\"level\":\"HC Level 1 CA\"}]},{\"name\":\"Tiarna\",\"jobs\":[{\"num\":25,\"note\":\"NDIS Care Coordinator\",\"period\":\"9am - 2pm\",\"hrsValue\":\"5\",\"workedDays\":{\"0\":true,\"1\":true,\"2\":true,\"5\":true,\"6\":true,\"7\":true,\"12\":true,\"13\":true},\"dayValues\":[\"5\",\"5\",\"5\",\"\",\"\",\"5\",\"5\",\"5\",\"\",\"\",\"\",\"\",\"5\",\"5\"],\"full_name\":\" Tiarna Angus\",\"level\":\"HC Level 2 FT/PT\"}]},{\"name\":\"Tracey\",\"jobs\":[{\"num\":3,\"note\":\"PC2/clean\",\"period\":\"8am-1pm\",\"hrsValue\":\"5\",\"workedDays\":{\"0\":true,\"5\":true,\"7\":true,\"12\":true},\"dayValues\":[\"5\",\"\",\"\",\"\",\"\",\"5\",\"\",\"5\",\"\",\"\",\"\",\"\",\"5\",\"\"],\"full_name\":\" Tracey Fox\",\"level\":\"HC Level 1 CA\"},{\"num\":5,\"note\":\"PCA/Extra\",\"period\":\"4pm-6pm\",\"hrsValue\":\"2\",\"workedDays\":{\"0\":true},\"dayValues\":[\"2\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Tracey Fox\",\"level\":\"HC Level 1 CA\"},{\"num\":9,\"note\":\"PCA 5\",\"period\":\"6pm-9pm\",\"hrsValue\":\"3\",\"workedDays\":{\"7\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"3\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Tracey Fox\",\"level\":\"HC Level 1 CA\"},{\"num\":10,\"note\":\"S/O-PC5\",\"period\":\"9pm-7am\",\"hrsValue\":\"1\",\"workedDays\":{\"7\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Tracey Fox\",\"level\":\"HC Level 1 CA\"},{\"num\":11,\"note\":\"PC5/Clean\",\"period\":\"7am-8am\",\"hrsValue\":\"1\",\"workedDays\":{\"7\":true},\"dayValues\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"1\",\"\",\"\",\"\",\"\",\"\",\"\"],\"full_name\":\" Tracey Fox\",\"level\":\"HC Level 1 CA\"}]}]', '[{\"ymd\":\"2025-12-17\",\"display\":\"17/12\",\"dayName\":\"Wednesday\",\"isWeekend\":false},{\"ymd\":\"2025-12-18\",\"display\":\"18/12\",\"dayName\":\"Thursday\",\"isWeekend\":false},{\"ymd\":\"2025-12-19\",\"display\":\"19/12\",\"dayName\":\"Friday\",\"isWeekend\":false},{\"ymd\":\"2025-12-20\",\"display\":\"20/12\",\"dayName\":\"Saturday\",\"isWeekend\":true},{\"ymd\":\"2025-12-21\",\"display\":\"21/12\",\"dayName\":\"Sunday\",\"isWeekend\":true},{\"ymd\":\"2025-12-22\",\"display\":\"22/12\",\"dayName\":\"Monday\",\"isWeekend\":false},{\"ymd\":\"2025-12-23\",\"display\":\"23/12\",\"dayName\":\"Tuesday\",\"isWeekend\":false},{\"ymd\":\"2025-12-24\",\"display\":\"24/12\",\"dayName\":\"Wednesday\",\"isWeekend\":false},{\"ymd\":\"2025-12-25\",\"display\":\"25/12\",\"dayName\":\"Thursday\",\"isWeekend\":false},{\"ymd\":\"2025-12-26\",\"display\":\"26/12\",\"dayName\":\"Friday\",\"isWeekend\":false},{\"ymd\":\"2025-12-27\",\"display\":\"27/12\",\"dayName\":\"Saturday\",\"isWeekend\":true},{\"ymd\":\"2025-12-28\",\"display\":\"28/12\",\"dayName\":\"Sunday\",\"isWeekend\":true},{\"ymd\":\"2025-12-29\",\"display\":\"29/12\",\"dayName\":\"Monday\",\"isWeekend\":false},{\"ymd\":\"2025-12-30\",\"display\":\"30/12\",\"dayName\":\"Tuesday\",\"isWeekend\":false}]');

-- --------------------------------------------------------

--
-- Table structure for table `timesheetreport_days`
--

CREATE TABLE `timesheetreport_days` (
  `day_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `day_index` int(11) NOT NULL,
  `staff_name` varchar(255) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `timesheetreport_entries`
--

CREATE TABLE `timesheetreport_entries` (
  `entry_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `row_number` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL,
  `hrs` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_days`
--

CREATE TABLE `timesheet_days` (
  `day_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `day_index` int(11) NOT NULL,
  `staff_name` varchar(255) DEFAULT NULL
) ;

--
-- Dumping data for table `timesheet_days`
--

INSERT INTO `timesheet_days` (`day_id`, `entry_id`, `day_index`, `staff_name`) VALUES
(2290, 388, 0, 'Ange'),
(2291, 388, 1, 'Ange'),
(2292, 388, 2, 'Ange'),
(2293, 388, 5, 'Ange'),
(2294, 388, 6, 'Ange'),
(2295, 388, 7, 'Ange'),
(2296, 388, 8, 'Ange'),
(2297, 388, 9, 'Ange'),
(2298, 388, 12, 'Ange'),
(2299, 388, 13, 'Ange'),
(2300, 389, 0, 'Patricia'),
(2301, 389, 1, 'Patricia'),
(2302, 389, 2, 'Ash S'),
(2303, 389, 5, 'Shontai'),
(2304, 389, 6, 'Ash S'),
(2305, 389, 7, 'Patricia'),
(2306, 389, 8, 'Patricia'),
(2307, 389, 9, 'Shontai'),
(2308, 389, 12, 'Shontai'),
(2309, 389, 13, 'Ash S'),
(2310, 390, 0, 'Tracey'),
(2311, 390, 1, 'Thuong'),
(2312, 390, 2, 'Tania'),
(2313, 390, 5, 'Tracey'),
(2314, 390, 6, 'Tania'),
(2315, 390, 7, 'Tracey'),
(2316, 390, 8, 'Ash S'),
(2317, 390, 9, 'Ash S'),
(2318, 390, 12, 'Tracey'),
(2319, 390, 13, 'Tania'),
(2320, 391, 0, 'Ash S'),
(2321, 391, 1, 'Manu'),
(2322, 391, 2, 'Manu'),
(2323, 391, 5, 'Manu'),
(2324, 391, 6, 'Manu'),
(2325, 391, 7, 'Manu'),
(2326, 391, 8, 'Brian'),
(2327, 391, 9, 'Manu'),
(2328, 391, 12, 'Manu'),
(2329, 391, 13, 'Manu'),
(2330, 392, 0, 'Tracey'),
(2331, 392, 2, 'Daved'),
(2332, 392, 5, 'Justin'),
(2333, 392, 6, 'Brian'),
(2334, 392, 9, 'Daved'),
(2335, 392, 13, 'Brian'),
(2336, 393, 0, 'Daved'),
(2337, 393, 1, 'Liana'),
(2338, 393, 2, 'Patricia'),
(2339, 393, 5, 'Patricia'),
(2340, 393, 6, 'Kerry'),
(2341, 393, 7, 'Daved'),
(2342, 393, 8, 'Kerry'),
(2343, 393, 9, 'Kerry'),
(2344, 393, 12, 'Patricia'),
(2345, 393, 13, 'Kerry'),
(2346, 394, 0, 'Daved'),
(2347, 394, 1, 'Liana'),
(2348, 394, 2, 'Patricia'),
(2349, 394, 5, 'Patricia'),
(2350, 394, 6, 'Kerry'),
(2351, 394, 7, 'Daved'),
(2352, 394, 8, 'Kerry'),
(2353, 394, 9, 'Kerry'),
(2354, 394, 12, 'Patricia'),
(2355, 394, 13, 'Kerry'),
(2356, 395, 0, 'Daved'),
(2357, 395, 1, 'Liana'),
(2358, 395, 2, 'Patricia'),
(2359, 395, 5, 'Patricia'),
(2360, 395, 6, 'Kerry'),
(2361, 395, 7, 'Daved'),
(2362, 395, 8, 'Kerry'),
(2363, 395, 9, 'Kerry'),
(2364, 395, 12, 'Patricia'),
(2365, 395, 13, 'Kerry'),
(2366, 396, 0, 'Justin'),
(2367, 396, 1, 'Jennifer'),
(2368, 396, 2, 'Liana'),
(2369, 396, 5, 'Jennifer'),
(2370, 396, 6, 'Jennifer'),
(2371, 396, 7, 'Tracey'),
(2372, 396, 8, 'Jennifer'),
(2373, 396, 9, 'Joshua'),
(2374, 396, 12, 'Jennifer'),
(2375, 396, 13, 'Jennifer'),
(2376, 397, 0, 'Justin'),
(2377, 397, 1, 'Jennifer'),
(2378, 397, 2, 'Liana'),
(2379, 397, 5, 'Jennifer'),
(2380, 397, 6, 'Jennifer'),
(2381, 397, 7, 'Tracey'),
(2382, 397, 8, 'Jennifer'),
(2383, 397, 9, 'Joshua'),
(2384, 397, 12, 'Jennifer'),
(2385, 397, 13, 'Jennifer'),
(2386, 398, 0, 'Justin'),
(2387, 398, 1, 'Jennifer'),
(2388, 398, 2, 'Liana'),
(2389, 398, 5, 'Jennifer'),
(2390, 398, 6, 'Jennifer'),
(2391, 398, 7, 'Tracey'),
(2392, 398, 8, 'Jennifer'),
(2393, 398, 9, 'Joshua'),
(2394, 398, 12, 'Jennifer'),
(2395, 398, 13, 'Jennifer'),
(2396, 399, 1, 'Maureen'),
(2397, 399, 2, 'Maureen'),
(2398, 399, 5, 'Maureen'),
(2399, 399, 6, 'Maureen'),
(2400, 399, 12, 'Maureen'),
(2401, 399, 13, 'Maureen'),
(2402, 400, 3, 'Shontai'),
(2403, 400, 4, 'Shontai'),
(2404, 400, 10, 'Patricia'),
(2405, 400, 11, 'Patricia'),
(2406, 401, 3, 'Ash S'),
(2407, 401, 4, 'Thuong'),
(2408, 401, 10, 'Thuong'),
(2409, 401, 11, 'Thuong'),
(2410, 402, 3, 'Manu'),
(2411, 402, 4, 'Ash S'),
(2412, 402, 10, 'Thuong'),
(2413, 402, 11, 'Ash S'),
(2414, 403, 3, 'Daved'),
(2415, 403, 4, 'Manu'),
(2416, 403, 11, 'Thuong'),
(2417, 404, 3, 'Kerry'),
(2418, 404, 4, 'Kerry'),
(2419, 404, 10, 'Ash S'),
(2420, 404, 11, 'Kerry'),
(2421, 405, 3, 'Kerry'),
(2422, 405, 4, 'Kerry'),
(2423, 405, 10, 'Ash S'),
(2424, 405, 11, 'Kerry'),
(2425, 406, 3, 'Kerry'),
(2426, 406, 4, 'Kerry'),
(2427, 406, 10, 'Ash S'),
(2428, 406, 11, 'Kerry'),
(2429, 407, 3, 'Liana'),
(2430, 407, 4, 'Liana'),
(2431, 407, 10, 'Liana'),
(2432, 407, 11, 'Liana'),
(2433, 408, 3, 'Liana'),
(2434, 408, 4, 'Liana'),
(2435, 408, 10, 'Liana'),
(2436, 408, 11, 'Liana'),
(2437, 409, 11, 'Liana'),
(2438, 410, 0, 'Tiarna'),
(2439, 410, 1, 'Tiarna'),
(2440, 410, 2, 'Tiarna'),
(2441, 410, 5, 'Tiarna'),
(2442, 410, 6, 'Tiarna'),
(2443, 410, 7, 'Tiarna'),
(2444, 410, 12, 'Tiarna'),
(2445, 410, 13, 'Tiarna'),
(2446, 411, 0, 'Karen'),
(2447, 411, 1, 'Karen'),
(2448, 411, 2, 'Karen'),
(2449, 411, 5, 'Karen'),
(2450, 411, 6, 'Karen'),
(2451, 411, 7, 'Karen'),
(2452, 412, 1, 'Joshua'),
(2453, 413, 0, 'Joshua'),
(2454, 413, 2, 'Joshua'),
(2455, 413, 5, 'Joshua'),
(2456, 413, 6, 'Joshua'),
(2457, 413, 7, 'Joshua'),
(2458, 413, 12, 'Joshua'),
(2459, 413, 13, 'Joshua'),
(2460, 414, 0, 'Jim'),
(2461, 414, 2, 'Jim'),
(2462, 414, 6, 'Jim'),
(2463, 414, 12, 'Jim'),
(2464, 415, 0, 'Carolyn'),
(2465, 415, 1, 'Carolyn'),
(2466, 415, 2, 'Carolyn'),
(2467, 415, 5, 'Justin'),
(2468, 415, 6, 'Carolyn'),
(2469, 415, 7, 'Carolyn'),
(2470, 415, 8, 'Carolyn'),
(2471, 415, 9, 'Carolyn'),
(2472, 415, 12, 'Justin'),
(2473, 415, 13, 'Carolyn'),
(2474, 416, 0, 'Barb M'),
(2475, 416, 1, 'Barb M'),
(2476, 416, 2, 'Barb M'),
(2477, 416, 5, 'Joshua'),
(2478, 416, 6, 'Barb M'),
(2479, 416, 7, 'Barb M'),
(2480, 416, 8, 'Barb M'),
(2481, 416, 9, 'Barb M'),
(2482, 416, 12, 'Joshua'),
(2483, 416, 13, 'Barb M'),
(2484, 417, 0, 'Serina'),
(2485, 417, 1, 'Justin'),
(2486, 417, 2, 'Justin'),
(2487, 417, 5, 'Serina'),
(2488, 417, 6, 'Serina'),
(2489, 417, 7, 'Serina'),
(2490, 417, 8, 'Justin'),
(2491, 417, 9, 'Justin'),
(2492, 417, 12, 'Justin'),
(2493, 417, 13, 'Justin'),
(2494, 418, 3, 'Tash'),
(2495, 418, 4, 'Tash'),
(2496, 418, 10, 'Tash'),
(2497, 418, 11, 'Tash'),
(2498, 419, 3, 'Barb M'),
(2499, 419, 4, 'Barb M'),
(2500, 419, 10, 'Barb M'),
(2501, 419, 11, 'Barb M'),
(2502, 420, 3, 'Tash'),
(2503, 420, 4, 'Tash'),
(2504, 420, 10, 'Tash'),
(2505, 420, 11, 'Tash');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_entries`
--

CREATE TABLE `timesheet_entries` (
  `entry_id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `row_number` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL,
  `hrs` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timesheet_entries`
--

INSERT INTO `timesheet_entries` (`entry_id`, `period_id`, `row_number`, `note`, `period`, `hrs`, `created_at`, `updated_at`) VALUES
(388, 5, 1, 'Manager', '7:30am-4pm', '7.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(389, 5, 2, 'PC1/clean', '7am-3:30pm', '7.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(390, 5, 3, 'PC2/clean', '8am-1pm', '5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(391, 5, 4, 'PC3/clean', '3:15pm-7:30pm', '4.25', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(392, 5, 5, 'PCA/Extra', '4pm-6pm', '2', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(393, 5, 6, 'PC4/Night', '5pm-9pm', '4', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(394, 5, 7, 'PC4/SO', '9pm-7am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(395, 5, 8, 'PC4/', '7am-8am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(396, 5, 9, 'PCA 5', '6pm-9pm', '3', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(397, 5, 10, 'S/O-PC5', '9pm-7am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(398, 5, 11, 'PC5/Clean', '7am-8am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(399, 5, 12, 'Nurse', '10am - 3pm', '5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(400, 5, 15, 'pc6/Clean', '7am-4pm', '8', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(401, 5, 16, 'pc7', '8.30am-3pm', '5.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(402, 5, 17, 'pc8', '3pm-7pm', '4', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(403, 5, 18, 'PCA/Extra', '4pm - 6pm', '2', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(404, 5, 19, 'S/O-PC', '5pm-9pm', '4', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(405, 5, 20, 's/o', '9pm-7am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(406, 5, 21, 'PC/Clean', '7AM-8:30AM', '1.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(407, 5, 22, 'PCA 5', '6pm-9pm', '3', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(408, 5, 23, 'S/O-PC5', '9pm-7am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(409, 5, 24, 'PC5/Clean', '7am-8am', '1', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(410, 5, 25, 'NDIS Care Coordinator', '9am - 2pm', '5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(411, 5, 26, 'Cleaning', '9am - 4pm', '6', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(412, 5, 27, 'Laundry', '9:30am - 3:30pm', '6', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(413, 5, 28, 'Laundry', '1pm - 3pm', '2', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(414, 5, 29, 'Maintenance', '10am - 3pm', '5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(415, 5, 30, 'Cook', '7:30am-1pm', '5.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(416, 5, 31, 'K-hand', '11am-1:30pm', '2.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(417, 5, 32, 'pc-Tea Cook', '4pm-6:30pm', '2.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(418, 5, 33, 'Cook', '7:30am-1:30pm', '6', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(419, 5, 34, 'k-Hand', '11am-1:30pm', '2.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29'),
(420, 5, 35, 'Tea cook', '4pm-6:30PM', '2.5', '2026-01-02 15:57:29', '2026-01-02 15:57:29');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_periods`
--

CREATE TABLE `timesheet_periods` (
  `period_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `num_days` int(11) NOT NULL,
  `num_rows` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `timesheet_periods`
--

INSERT INTO `timesheet_periods` (`period_id`, `start_date`, `num_days`, `num_rows`, `name`, `created_at`, `updated_at`) VALUES
(5, '2025-12-17', 14, 40, 'TimeSheet 17/12 - 30/12', '2026-01-02 11:37:02', '2026-01-02 11:37:02');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_reports`
--

CREATE TABLE `timesheet_reports` (
  `report_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `num_days` int(11) NOT NULL,
  `num_rows` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_report_days`
--

CREATE TABLE `timesheet_report_days` (
  `day_id` int(11) NOT NULL,
  `entry_id` int(11) NOT NULL,
  `day_index` int(11) NOT NULL,
  `staff_name` varchar(255) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_report_entries`
--

CREATE TABLE `timesheet_report_entries` (
  `entry_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `row_number` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL,
  `hrs` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD KEY `idx_customer_name` (`full_name`);

--
-- Indexes for table `customer_invoices`
--
ALTER TABLE `customer_invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `idx_invoice_customer` (`customer_id`),
  ADD KEY `idx_invoice_date` (`invoice_date`),
  ADD KEY `idx_invoice_no` (`invoice_no`);

--
-- Indexes for table `customer_notes`
--
ALTER TABLE `customer_notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_is_completed` (`is_completed`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_notes`
--
ALTER TABLE `employee_notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_is_completed` (`is_completed`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `employers`
--
ALTER TABLE `employers`
  ADD PRIMARY KEY (`employer_id`),
  ADD KEY `idx_employer_name` (`full_name`);

--
-- Indexes for table `payroll_nexgenus`
--
ALTER TABLE `payroll_nexgenus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payroll_nexgenus_entries`
--
ALTER TABLE `payroll_nexgenus_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_nexgenus_entries_payroll_id` (`payroll_id`);

--
-- Indexes for table `social_sheets`
--
ALTER TABLE `social_sheets`
  ADD PRIMARY KEY (`sheet_id`),
  ADD KEY `idx_social_sheets_created` (`created_at`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_position` (`position`);

--
-- Indexes for table `timesheetreport`
--
ALTER TABLE `timesheetreport`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `timesheetreport_days`
--
ALTER TABLE `timesheetreport_days`
  ADD PRIMARY KEY (`day_id`),
  ADD UNIQUE KEY `unique_entry_day` (`entry_id`,`day_index`),
  ADD KEY `idx_days_entry` (`entry_id`);

--
-- Indexes for table `timesheetreport_entries`
--
ALTER TABLE `timesheetreport_entries`
  ADD PRIMARY KEY (`entry_id`),
  ADD UNIQUE KEY `unique_report_row` (`report_id`,`row_number`),
  ADD KEY `idx_entries_report` (`report_id`);

--
-- Indexes for table `timesheet_days`
--
ALTER TABLE `timesheet_days`
  ADD PRIMARY KEY (`day_id`),
  ADD UNIQUE KEY `unique_entry_day` (`entry_id`,`day_index`),
  ADD KEY `idx_days_entry` (`entry_id`);

--
-- Indexes for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  ADD PRIMARY KEY (`entry_id`),
  ADD UNIQUE KEY `unique_period_row` (`period_id`,`row_number`),
  ADD KEY `idx_entries_period` (`period_id`);

--
-- Indexes for table `timesheet_periods`
--
ALTER TABLE `timesheet_periods`
  ADD PRIMARY KEY (`period_id`);

--
-- Indexes for table `timesheet_reports`
--
ALTER TABLE `timesheet_reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `timesheet_report_days`
--
ALTER TABLE `timesheet_report_days`
  ADD PRIMARY KEY (`day_id`),
  ADD UNIQUE KEY `unique_entry_day` (`entry_id`,`day_index`),
  ADD KEY `idx_days_entry` (`entry_id`);

--
-- Indexes for table `timesheet_report_entries`
--
ALTER TABLE `timesheet_report_entries`
  ADD PRIMARY KEY (`entry_id`),
  ADD UNIQUE KEY `unique_report_row` (`report_id`,`row_number`),
  ADD KEY `idx_entries_report` (`report_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer_invoices`
--
ALTER TABLE `customer_invoices`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_notes`
--
ALTER TABLE `customer_notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `employee_notes`
--
ALTER TABLE `employee_notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employers`
--
ALTER TABLE `employers`
  MODIFY `employer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_nexgenus`
--
ALTER TABLE `payroll_nexgenus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payroll_nexgenus_entries`
--
ALTER TABLE `payroll_nexgenus_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=303;

--
-- AUTO_INCREMENT for table `social_sheets`
--
ALTER TABLE `social_sheets`
  MODIFY `sheet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `timesheetreport`
--
ALTER TABLE `timesheetreport`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheetreport_days`
--
ALTER TABLE `timesheetreport_days`
  MODIFY `day_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheetreport_entries`
--
ALTER TABLE `timesheetreport_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=228;

--
-- AUTO_INCREMENT for table `timesheet_days`
--
ALTER TABLE `timesheet_days`
  MODIFY `day_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=443;

--
-- AUTO_INCREMENT for table `timesheet_periods`
--
ALTER TABLE `timesheet_periods`
  MODIFY `period_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheet_reports`
--
ALTER TABLE `timesheet_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheet_report_days`
--
ALTER TABLE `timesheet_report_days`
  MODIFY `day_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheet_report_entries`
--
ALTER TABLE `timesheet_report_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer_notes`
--
ALTER TABLE `customer_notes`
  ADD CONSTRAINT `customer_notes_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_notes`
--
ALTER TABLE `employee_notes`
  ADD CONSTRAINT `employee_notes_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheetreport_days`
--
ALTER TABLE `timesheetreport_days`
  ADD CONSTRAINT `timesheetreport_days_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `timesheetreport_entries` (`entry_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheetreport_entries`
--
ALTER TABLE `timesheetreport_entries`
  ADD CONSTRAINT `timesheetreport_entries_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `timesheetreport` (`report_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheet_days`
--
ALTER TABLE `timesheet_days`
  ADD CONSTRAINT `timesheet_days_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `timesheet_entries` (`entry_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  ADD CONSTRAINT `timesheet_entries_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `timesheet_periods` (`period_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheet_report_days`
--
ALTER TABLE `timesheet_report_days`
  ADD CONSTRAINT `timesheet_report_days_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `timesheet_report_entries` (`entry_id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheet_report_entries`
--
ALTER TABLE `timesheet_report_entries`
  ADD CONSTRAINT `timesheet_report_entries_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `timesheet_reports` (`report_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
