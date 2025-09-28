module lemanflow::passport_tests {
    use std::string;
    use lemanflow::passport::{
        new_event_info,
        get_event_info_fields,
        burn_event_info
    };

    #[test]
    public fun test_event_info_fields() {
        // Strings : utiliser std::string::utf8(b"...")
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

        // Très important : consommer la valeur (pas de drop sur EventInfo)
        burn_event_info(ev);
    }
}
