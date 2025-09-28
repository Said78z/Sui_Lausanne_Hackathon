module hackevents::checkin {
    use sui::object::{UID, ID};
    use sui::object;
    use sui::tx_context;
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::event;
    use sui::dynamic_field as df;

    // Capacité admin (création/gestion d'événements)
    public struct AdminCap has key, store {
        id: UID,
        admin: address,
    }

    // Objet Event (une étape du hackathon)
    public struct Event has key, store {
        id: UID,
        organizer: address,
        name: vector<u8>,
        description: vector<u8>,
        points: u64,
        active: bool,
        // Dynamic fields: participant address -> bool (a déjà check-in)
        checkins_root: UID,
    }

    // Événements Move émis on-chain
    public struct EventCreated has copy, drop, store {
        organizer: address,
        event_id: ID,
        name: vector<u8>,
        points: u64,
        active: bool,
    }

    public struct EventToggled has copy, drop, store {
        organizer: address,
        event_id: ID,
        active: bool,
    }

    public struct CheckinEmitted has copy, drop, store {
        event_id: ID,
        participant: address,
    }

    // ----------------------------------------------------------------
    // Bootstrap: donne à l'appelant une AdminCap (pratique pour tests/POC)
    // ----------------------------------------------------------------
    public fun bootstrap(ctx: &mut TxContext): AdminCap {
        let sender = tx_context::sender(ctx);
        AdminCap { id: object::new(ctx), admin: sender }
    }

    // ----------------------------------------------------------------
    // Création d'un Event (admin)
    // - entry ne peut pas retourner la ressource => on la partage (shared)
    // ----------------------------------------------------------------
    public entry fun create_event(
        cap: &AdminCap,
        name: vector<u8>,
        description: vector<u8>,
        points: u64,
        active: bool,
        ctx: &mut TxContext
    ) {
        let organizer = cap.admin;
        let ev = Event {
            id: object::new(ctx),
            organizer,
            name,
            description,
            points,
            active,
            checkins_root: object::new(ctx),
        };
        let ev_id: ID = object::id(&ev);

        event::emit(EventCreated { organizer, event_id: ev_id, name: ev.name, points, active });
        // Partage l'objet pour que n'importe quel participant puisse s'y référer
        transfer::share_object(ev);
    }

    // ----------------------------------------------------------------
    // (Optionnel) Activer/Désactiver un Event (admin)
    // ----------------------------------------------------------------
    public entry fun set_active(cap: &AdminCap, ev: &mut Event, active: bool) {
        assert!(cap.admin == ev.organizer, 0);
        ev.active = active;
        event::emit(EventToggled { organizer: ev.organizer, event_id: object::id(ev), active });
    }

    // ----------------------------------------------------------------
    // Check-in d'un participant
    // - on utilise l'adresse du sender comme identité du participant
    // - empêche le double check-in via dynamic fields
    // ----------------------------------------------------------------
    public entry fun check_in(ev: &mut Event, ctx: &mut TxContext) {
        assert!(ev.active, 1);
        let who = tx_context::sender(ctx);

        // double-claim guard
        if (!df::exists_<address>(&ev.checkins_root, who)) {
    df::add<address, bool>(&mut ev.checkins_root, who, true);
    event::emit(CheckinEmitted { event_id: object::id(ev), participant: who });
} else {
    assert!(false, 2);
}

    }

    // ----------------------------------------------------------------
    // Lecture utilitaire: a-t-il check-in ?
    // ----------------------------------------------------------------
    public fun has_checked_in(ev: &Event, who: address): bool {
        df::exists_<address>(&ev.checkins_root, who)
    }

    public entry fun burn_admincap(cap: AdminCap) {
    // détruit l’AdminCap proprement
    let AdminCap { id, admin: _ } = cap;
    object::delete(id);
    }
}
