-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2021 at 04:55 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eth_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `new_table`
--

CREATE TABLE `new_table` (
  `id` int(11) NOT NULL,
  `public_key` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `private_key` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `content_name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `new_table`
--

INSERT INTO `new_table` (`id`, `public_key`, `private_key`, `content_name`) VALUES
(4, '0x67C8e757a0a50021009D66dA8aEa5De76712dD34', '0xbe4a2557abd7be4552a5d270dc818e0aeb7afde9f0682c5946a18bbd84d40951', 'Nic1'),
(7, '0x64CEcCF3e287a99af1A724cA0FCa12871faA80A8', '0x5367a84c194a7ebcd6d7bdf42d98706c58c464f1426aacd78c29f9f417f97080', 'Nic2'),
(8, '0x4b154b4399a21E5709bb7bb991c5896bb8b7756c', '0x2922bb51f759570b767ca924a46bc9d2738e3a681fff1b7270d5b62bc7ec415c', 'Nic3'),
(11, '0x67c5127243Df8C760FefE5086d82fe3fa21d43F0', '0xbe17a4bf01619c5ec8f53c17f144374c1df6b6c454ed413f8d9856da0e502e67', 'adasd'),
(13, '0x757B767E8f123DABa8c37E1a795f3D060908aAA6', '0x9ddd29fb81f483be21106e301091268a735ee21cba4b6f6ac7d65f34cc83c012', 'baklol'),
(14, '0x95834e9501874DEFB39FAf3791810DE16E27865f', '0x380529c32fc58dea0a5d277d94f5ad0de52b47eb3c4081a53e0717b974511910', 'hello'),
(16, '0xfF90571d0F3f01Fab5418406f565066EAD8FD1c8', '0x2874c48e827f828719c815bdae2ab2a4d09e4691d6455f77a1f4832ad37cd91b', 'testnic'),
(17, '0xBbab3c3CBcBde5541FE2ddf1221d946317C4de46', '0x4522205fe166d1583792d5693b9212b64c9b9f756987d32896a59d4f0f442ce8', 'testnic1'),
(18, '0x0CB7bA024A21718BA5bA3B8E0C4dAfFFD49c7aa6', '0x84b31aac0cf5f87fede332e01e4cec51755dc8ffd4625c613e28b3cb58897578', 'testnic2');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `new_table`
--
ALTER TABLE `new_table`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `public_key_UNIQUE` (`public_key`),
  ADD UNIQUE KEY `private_key_UNIQUE` (`private_key`),
  ADD UNIQUE KEY `id_UNIQUE` (`id`),
  ADD UNIQUE KEY `user_name_UNIQUE` (`content_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `new_table`
--
ALTER TABLE `new_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
