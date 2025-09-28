module lemanflow::passport {
    use sui::object;
    use sui::transfer;
    use sui::tx_context::{TxContext, sender};
    use std::string::{Self, String};
    use std::vector;

    //
    // === Structures principales ===
    //

    /// Stocke les infos d’un événement
    public struct EventInfo has store {
        event_id: u64,
        name: String,
        description: String,
        start_date: u64,
        end_date: u64,
        max_participants: u64,
        current_participants: u64,
        is_active: bool,
        created_at: u64,
    }

    /// Capability pour gérer les passeports
    public struct PassportCap has key {
        id: object::UID,
        admin: address,
    }

    /// Passeport émis pour un participant
    public struct Passport has key {
        id: object::UID,
        owner: address,
        event_id: u64,
        issued_at: u64,
    }

    /// Liste des événements créés
    public struct EventRegistry has key {
        id: object::UID,
        events: vector<EventInfo>,
    }

    // 
    // === Initialisation ===
    //

    /// Crée la capability admin et le registre d’événements
    public fun bootstrap(ctx: &mut TxContext) {
        let cap = PassportCap {
            id: object::new(ctx),
            admin: sender(ctx),
        };
        transfer::share_object(cap);

        let registry = EventRegistry {
            id: object::new(ctx),
            events: vector::empty<EventInfo>(),
        };
        transfer::share_object(registry);
    }

    //
    // === Création d’événements ===
    //

    /// Constructeur d’un EventInfo
    public fun new_event_info(
        event_id: u64,
        name: String,
        desc: String,
        start_date: u64,
        end_date: u64,
        max_participants: u64,
        created_at: u64
    ): EventInfo {
        EventInfo {
            event_id,
            name,
            description: desc,
            start_date,
            end_date,
            max_participants,
            current_participants: 0,
            is_active: true,
            created_at,
        }
    }

    /// Ajoute un événement au registre
    public fun create_event(
        registry: &mut EventRegistry,
        event_id: u64,
        name: String,
        desc: String,
        start_date: u64,
        end_date: u64,
        max_participants: u64,
        ctx: &mut TxContext
    ) {
        let ev = new_event_info(
            event_id,
            name,
            desc,
            start_date,
            end_date,
            max_participants,
            ctx.epoch(),
        );
        vector::push_back(&mut registry.events, ev);
    }

    //
    // === Passeports ===
    //

    /// Mint un passeport pour un participant
    public fun mint_passport(
        cap: &PassportCap,
        event_id: u64,
        participant: address,
        ctx: &mut TxContext
    ): Passport {
        assert!(sender(ctx) == cap.admin, 100);

        Passport {
            id: object::new(ctx),
            owner: participant,
            event_id,
            issued_at: ctx.epoch(),
        }
    }

    //
    // === Helpers pour les tests ===
    //

    /// Retourne un tuple avec les champs de EventInfo (lecture externe)
    public fun get_event_info_fields(ev: &EventInfo): (u64, u64, bool, u64) {
        (ev.event_id, ev.max_participants, ev.is_active, ev.created_at)
    }

    /// Consomme un EventInfo (utile car il n’a pas drop)
    public fun burn_event_info(ev: EventInfo) {
        let EventInfo {
            event_id: _,
            name: _,
            description: _,
            start_date: _,
            end_date: _,
            max_participants: _,
            current_participants: _,
            is_active: _,
            created_at: _,
        } = ev;
    }

    public entry fun burn_PassportCap(cap: PassportCap) {
        // détruit l’AdminCap proprement
        let PassportCap { id, admin: _ } = cap;
        object::delete(id);
    }

public fun burn_PassportRegistry(registry: EventRegistry) {
    let EventRegistry { id, mut events } = registry;
    // vider correctement le vecteur
    while (!vector::is_empty(&events)) {
        let ev = vector::pop_back(&mut events);
        burn_event_info(ev); // consomme chaque EventInfo
    };
    vector::destroy_empty<EventInfo>(events); 
    object::delete(id);
}




public fun burn_passport(p: Passport) {
    let Passport { id, owner: _, event_id: _, issued_at: _ } = p;
    object::delete(id);
}

    //
    // === Getter admin (exemple) ===
    //

    public fun get_admin(cap: &PassportCap): address {
        cap.admin
    }

    /// Retourne une référence immuable vers un EventInfo dans le registre
    public fun get_event_info(registry: &EventRegistry, idx: u64): &EventInfo {
    vector::borrow(&registry.events, idx)
    }   
    /// Retourne le nombre d’événements dans le registre
    public fun get_event_count(registry: &EventRegistry): u64 {
        vector::length(&registry.events)
    }

    /// Retourne un événement par son index
    public fun get_event_by_index(registry: &EventRegistry, idx: u64): &EventInfo {
        vector::borrow(&registry.events, idx)
    }

    public fun get_event_id(p: &Passport): u64 {
    p.event_id
    }

    public fun get_owner(p: &Passport): address {
    p.owner
    }

}