--
-- PostgreSQL database dump
--

\restrict qsTnVm3cAw4nzVMxswMfozO3rN5RdTvPVUvHR08iMBr1drD64mGmbJlUUdAgom1

-- Dumped from database version 18.7
-- Dumped by pg_dump version 18.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_vacation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vacations DROP CONSTRAINT IF EXISTS vacations_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_pkey;
DROP TABLE IF EXISTS public.vacations;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.likes;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    user_id integer NOT NULL,
    vacation_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name text,
    last_name text,
    email text,
    password text,
    role text DEFAULT 'user'::text,
    CONSTRAINT chk_user_role CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vacations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacations (
    vacation_id integer NOT NULL,
    destination text,
    vacation_description text,
    start_date date,
    end_date date,
    price integer,
    image_file_name text
);


--
-- Name: vacations_vacation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.vacations ALTER COLUMN vacation_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.vacations_vacation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.likes (user_id, vacation_id) FROM stdin;
2	1
2	2
1	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, first_name, last_name, email, password, role) FROM stdin;
1	Admin	Demo	admin@demo.com	$2b$10$jr/3/7JugokQA6Qy6dTAWu0qKkE0y3mPA0rZ5Yh8d2VGGG6BGMAWm	admin
2	Dana	Cohen	user@demo.com	$2b$10$0nowjsXijOQ3gW7Wy8gHzOOVVxvfEiBz57q/I7DUPei5BvFdOxkDS	user
\.


--
-- Data for Name: vacations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vacations (vacation_id, destination, vacation_description, start_date, end_date, price, image_file_name) FROM stdin;
1	Rome	Explore ancient wonders, the Colosseum, the Pantheon, and top-notch dining in fabulous restaurants.	2026-10-28	2026-11-09	1931	https://images.unsplash.com/photo-1552832230-c0197dd311b5
2	Rhodes	Enjoy a cocktail by the sea with incredible seaside views and Pefkos Beach nearby.	2026-11-08	2026-11-22	462	https://images.unsplash.com/photo-1530841377377-3ff06c0ca713
4	Corfu	Discover beautiful Greek island landscapes, historic architecture, and crystal-clear waters.	2026-12-13	2026-12-27	699	https://images.unsplash.com/photo-1533105079780-92b9be482077
5	Hilo	Experience lush tropical rainforests, waterfalls, and the unique charm of Hawaii.	2026-12-17	2026-12-31	1200	https://images.unsplash.com/photo-1518709268805-4e9042af9f23
6	Montego Bay	Unwind on Caribbean white-sand beaches with luxury resorts and vibrant local culture.	2027-01-03	2027-01-17	1450	https://images.unsplash.com/photo-1544644181-1484b3fdfc62
7	Puerto Rico Island	Experience rich Spanish heritage, El Yunque rainforest, and vibrant coastal nightlife.	2027-02-01	2027-02-14	1350	https://images.unsplash.com/photo-1589556264800-01d0b4bbfa84
8	Las Vegas	Enjoy world-class entertainment, luxury hotels, fine dining, and vibrant nightlife on the Strip.	2027-02-15	2027-02-22	950	https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d
9	Honolulu	Relax on Waikiki Beach, visit historical landmarks, and enjoy tropical island paradise views.	2027-03-01	2027-03-15	1600	https://images.unsplash.com/photo-1542332213-9b5a5a3fad35
10	Kailua-Kona	Explore coffee plantations, manta ray night dives, and stunning sunny coasts in Hawaii.	2027-03-10	2027-03-24	1550	https://images.unsplash.com/photo-1506953823976-52e1fdc0149a
11	Port Antonio	Discover lush jungles, hidden waterfalls, and relaxed coastal vibes in Jamaica.	2027-04-05	2027-04-19	1100	https://images.unsplash.com/photo-1544551763-46a013bb70d5
12	Paris	Experience romantic walks along the Seine, art at the Louvre, and world-class culinary delights.	2027-05-01	2027-05-12	1750	https://images.unsplash.com/photo-1502602898657-3e91760cbb34
\.


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, false);


--
-- Name: vacations_vacation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vacations_vacation_id_seq', 13, false);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, vacation_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: vacations vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_pkey PRIMARY KEY (vacation_id);


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: likes likes_vacation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_vacation_id_fkey FOREIGN KEY (vacation_id) REFERENCES public.vacations(vacation_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qsTnVm3cAw4nzVMxswMfozO3rN5RdTvPVUvHR08iMBr1drD64mGmbJlUUdAgom1

