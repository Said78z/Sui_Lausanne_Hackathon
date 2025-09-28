module hackevents::checkin_tests {
    use sui::test_scenario as ts;
    use hackevents::checkin;

    #[test]
    fun test_create_and_checkin() {
        let admin: address = @0xA;
        let user: address = @0xB;

        // Démarre un scénario avec admin
        let mut s = ts::begin(admin);

        // ===== Transaction 1 (admin crée l’event) =====
        {
            // Donne une AdminCap à admin
            let cap = checkin::bootstrap(ts::ctx(&mut s));

            // Crée un event partagé
            checkin::create_event(
                &cap,
                b"Lunch Day 1",
                b"Buffet d'ouverture",
                10,
                true,
                ts::ctx(&mut s)
            );
            checkin::burn_admincap(cap);
        };
        ts::next_tx(&mut s, admin); // Fin de la tx d’admin → l’event est publié en shared

        // ===== Transaction 2 (user check-in) =====
        ts::next_tx(&mut s, user);

        // Récupère l'event partagé
        let mut ev = ts::take_shared<checkin::Event>(&mut s);

        // L’utilisateur fait son check-in
        checkin::check_in(&mut ev, ts::ctx(&mut s));

        // Vérifie que le check-in est bien enregistré
        assert!(checkin::has_checked_in(&ev, user), 100);

        // Remet l’event dans l’inventaire
        ts::return_shared(ev);

        ts::end(s);
    }
}
