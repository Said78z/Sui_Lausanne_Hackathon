#[test_only]
module lemanflow::passport_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::tx_context;
    use std::string;
    use std::vector;

    use lemanflow::passport::{
        Self,                         // permet d'appeler passport::xxx
        EventInfo,
        PassportCap,
        Passport,
        EventRegistry,
        bootstrap,
        create_event,
        new_event_info,
        get_event_info_fields,
        burn_event_info,
        mint_passport,
        get_admin,
        get_event_count,
        get_event_info,
    };

    // === Constantes pour les tests ===
    const ADMIN: address = @0xA1;
    const USER: address = @0xB2;
    const NON_ADMIN: address = @0xC3;

    //
    // === Test EventInfo (déjà existant) ===
    //
    #[test]
    fun test_event_info_fields() {
        let ev = new_event_info(
            0,
            string::utf8(b"Test"),
            string::utf8(b"Desc"),
            1000,
            2000,
            10,
            123456
        );

        let (event_id, max_participants, is_active, created_at) = get_event_info_fields(&ev);
        assert!(event_id == 0, 100);
        assert!(max_participants == 10, 101);
        assert!(is_active, 102);
        assert!(created_at == 123456, 103);

        burn_event_info(ev);
    }

    //
    // === Test bootstrap (init) ===
    //
    #[test]
    fun test_bootstrap() {
        let mut s: Scenario = ts::begin(ADMIN);
        bootstrap(ts::ctx(&mut s));
        ts::next_tx(&mut s, ADMIN); // rendre visibles les objets créés

        let cap: PassportCap = ts::take_shared(&mut s);
        let registry: EventRegistry = ts::take_shared(&mut s);

        assert!(get_admin(&cap) == ADMIN, 200);
        assert!(get_event_count(&registry) == 0, 201);

        passport::burn_PassportCap(cap);
        passport::burn_PassportRegistry(registry);

        ts::end(s);
    }

    //
    // === Test création d’événement ===
    //
    #[test]
    fun test_create_event() {
        let mut s: Scenario = ts::begin(ADMIN);
        bootstrap(ts::ctx(&mut s));
        ts::next_tx(&mut s, ADMIN);

        let mut registry: EventRegistry = ts::take_shared(&mut s);

        create_event(
            &mut registry,
            42,
            string::utf8(b"My Event"),
            string::utf8(b"Description"),
            1000,
            2000,
            50,
            ts::ctx(&mut s)
        );

        assert!(get_event_count(&registry) == 1, 300);
        let ev = get_event_info(&registry, 0);
        let (id, max_p, active, _) = get_event_info_fields(ev);
        assert!(id == 42, 301);
        assert!(max_p == 50, 302);
        assert!(active, 303);

        passport::burn_PassportRegistry(registry);
        ts::end(s);
    }

    //
    // === Test mint passeport (succès) ===
    //
    #[test]
    fun test_mint_passport_success() {
        let mut s: Scenario = ts::begin(ADMIN);
        bootstrap(ts::ctx(&mut s));
        ts::next_tx(&mut s, ADMIN);

        let cap: PassportCap = ts::take_shared(&mut s);

        let p: Passport = mint_passport(&cap, 42, USER, ts::ctx(&mut s));
        assert!(passport::get_owner(&p) == USER, 400);
        assert!(passport::get_event_id(&p) == 42, 401);

        passport::burn_PassportCap(cap);
        passport::burn_passport(p);
        ts::end(s);
    }

    //
    // === Test mint passeport (échec non-admin) ===
    //
    #[test, expected_failure(abort_code = 100)]
    fun test_mint_passport_fail_non_admin() {
        // bootstrap avec ADMIN
        let mut s: Scenario = ts::begin(ADMIN);
        bootstrap(ts::ctx(&mut s));

        // nouvelle transaction, mais sender = NON_ADMIN
        ts::next_tx(&mut s, NON_ADMIN);

        let cap: PassportCap = ts::take_shared(&mut s);

        // Doit échouer car sender != cap.admin (abort code 100)
        let p = mint_passport(&cap, 42, USER, ts::ctx(&mut s));
        passport::burn_PassportCap(cap);
        passport::burn_passport(p);
        ts::end(s);
    }

    //
    // === Test get_admin ===
    //
    #[test]
    fun test_get_admin() {
        let mut s: Scenario = ts::begin(ADMIN);
        bootstrap(ts::ctx(&mut s));
        ts::next_tx(&mut s, ADMIN);

        let cap: PassportCap = ts::take_shared(&mut s);
        assert!(get_admin(&cap) == ADMIN, 500);

        passport::burn_PassportCap(cap);
        ts::end(s);
    }
}
