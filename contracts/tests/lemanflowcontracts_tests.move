#[test_only]
module lemanflowcontracts::grant_pool_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::vector;
    use lemanflowcontracts::grant_pool::{Self, GrantPool};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0xA1;
    const USER2: address = @0xA2;
    const USER3: address = @0xA3;
    const NON_ADMIN: address = @0xAB;

    // Test constants
    const EVENT_ID: u64 = 12345;
    const INITIAL_AMOUNT: u64 = 5000000000; // 5 SUI

    #[test]
    fun test_pool_creation_with_init_for_testing() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            // Use init_for_testing to create a pool without Balance issues
            let pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            
            // Test basic properties
            assert!(grant_pool::get_admin(&pool) == ADMIN, 1);
            assert!(grant_pool::get_event_id(&pool) == 1, 2); // init_for_testing sets event_id to 1
            assert!(!grant_pool::is_distributed(&pool), 3);
            assert!(grant_pool::get_balance(&pool) == 0, 4); // Empty balance initially
            
            // Test payouts are empty initially
            let payouts = grant_pool::get_payouts(&pool);
            assert!(vector::is_empty(&payouts), 5);
            
            // Test pool info function
            let (admin, event_id, distributed, balance, stored_payouts) = grant_pool::get_pool_info(&pool);
            assert!(admin == ADMIN, 6);
            assert!(event_id == 1, 7);
            assert!(!distributed, 8);
            assert!(balance == 0, 9);
            assert!(vector::is_empty(&stored_payouts), 10);
            
            // Transfer to shared for cleanup
            sui::transfer::public_share_object(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_payout_configuration() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            
            // Set payouts using the actual function
            let payouts = vector[1500000000u64, 1000000000u64, 500000000u64]; // 1.5, 1.0, 0.5 SUI
            grant_pool::set_payouts<SUI>(&mut pool, payouts, test_scenario::ctx(&mut scenario));
            
            // Verify payouts were set correctly
            let stored_payouts = grant_pool::get_payouts(&pool);
            assert!(stored_payouts == payouts, 11);
            assert!(vector::length(&stored_payouts) == 3, 12);
            
            // Verify individual payout amounts
            assert!(*vector::borrow(&stored_payouts, 0) == 1500000000u64, 13);
            assert!(*vector::borrow(&stored_payouts, 1) == 1000000000u64, 14);
            assert!(*vector::borrow(&stored_payouts, 2) == 500000000u64, 15);
            
            // Verify pool is still not distributed
            assert!(!grant_pool::is_distributed(&pool), 16);
            
            sui::transfer::public_share_object(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_payout_configurations() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            
            // Test single winner
            let single_payout = vector[2000000000u64]; // 2 SUI
            grant_pool::set_payouts<SUI>(&mut pool, single_payout, test_scenario::ctx(&mut scenario));
            let stored = grant_pool::get_payouts(&pool);
            assert!(vector::length(&stored) == 1, 17);
            assert!(*vector::borrow(&stored, 0) == 2000000000u64, 18);
            
            // Test two winners
            let double_payout = vector[1200000000u64, 800000000u64]; // 1.2, 0.8 SUI
            grant_pool::set_payouts<SUI>(&mut pool, double_payout, test_scenario::ctx(&mut scenario));
            let stored2 = grant_pool::get_payouts(&pool);
            assert!(vector::length(&stored2) == 2, 19);
            assert!(*vector::borrow(&stored2, 0) == 1200000000u64, 20);
            assert!(*vector::borrow(&stored2, 1) == 800000000u64, 21);
            
            // Test five winners
            let five_payout = vector[1000000000u64, 750000000u64, 500000000u64, 250000000u64, 100000000u64];
            grant_pool::set_payouts<SUI>(&mut pool, five_payout, test_scenario::ctx(&mut scenario));
            let stored3 = grant_pool::get_payouts(&pool);
            assert!(vector::length(&stored3) == 5, 22);
            assert!(*vector::borrow(&stored3, 0) == 1000000000u64, 23);
            assert!(*vector::borrow(&stored3, 4) == 100000000u64, 24);
            
            sui::transfer::public_share_object(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_pool_state_transitions() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            
            // Initial state: not distributed
            assert!(!grant_pool::is_distributed(&pool), 25);
            
            // Set payouts
            let payouts = vector[800000000u64, 600000000u64, 400000000u64]; // 0.8, 0.6, 0.4 SUI
            grant_pool::set_payouts<SUI>(&mut pool, payouts, test_scenario::ctx(&mut scenario));
            
            // Still not distributed after setting payouts
            assert!(!grant_pool::is_distributed(&pool), 26);
            
            // Verify payouts are stored
            let stored_payouts = grant_pool::get_payouts(&pool);
            assert!(vector::length(&stored_payouts) == 3, 27);
            
            // Verify pool info reflects current state
            let (admin, event_id, distributed, balance, stored_payouts2) = grant_pool::get_pool_info(&pool);
            assert!(admin == ADMIN, 28);
            assert!(event_id == 1, 29);
            assert!(!distributed, 30);
            assert!(balance == 0, 31);
            assert!(vector::length(&stored_payouts2) == 3, 32);
            
            sui::transfer::public_share_object(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lemanflowcontracts::grant_pool::ENotAdmin)]
    fun test_non_admin_cannot_set_payouts() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create pool as admin
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            sui::transfer::public_share_object(pool);
        };
        
        // Try to set payouts as non-admin (should fail)
        test_scenario::next_tx(&mut scenario, NON_ADMIN);
        {
            let mut pool = test_scenario::take_shared<GrantPool<SUI>>(&scenario);
            let payouts = vector[600000000u64, 400000000u64];
            
            grant_pool::set_payouts<SUI>(&mut pool, payouts, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = lemanflowcontracts::grant_pool::EEmptyPayouts)]
    fun test_empty_payouts_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            let empty_payouts = vector::empty<u64>();
            
            // This should fail with EEmptyPayouts
            grant_pool::set_payouts<SUI>(&mut pool, empty_payouts, test_scenario::ctx(&mut scenario));
            
            sui::transfer::public_share_object(pool);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_comprehensive_hackathon_scenario() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // 1. Create pool
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let pool = grant_pool::init_for_testing<SUI>(test_scenario::ctx(&mut scenario));
            
            // Verify initial state
            assert!(grant_pool::get_admin(&pool) == ADMIN, 33);
            assert!(!grant_pool::is_distributed(&pool), 34);
            assert!(vector::is_empty(&grant_pool::get_payouts(&pool)), 35);
            assert!(grant_pool::get_balance(&pool) == 0, 36);
            
            sui::transfer::public_share_object(pool);
        };
        
        // 2. Configure payouts for hackathon prizes
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut pool = test_scenario::take_shared<GrantPool<SUI>>(&scenario);
            
            // Set realistic hackathon prize distribution
            let hackathon_payouts = vector[
                2000000000u64, // 1st place: 2 SUI
                1200000000u64, // 2nd place: 1.2 SUI  
                800000000u64,  // 3rd place: 0.8 SUI
                500000000u64,  // 4th place: 0.5 SUI
                300000000u64   // 5th place: 0.3 SUI
            ];
            
            grant_pool::set_payouts<SUI>(&mut pool, hackathon_payouts, test_scenario::ctx(&mut scenario));
            
            // Verify configuration
            let stored_payouts = grant_pool::get_payouts(&pool);
            assert!(vector::length(&stored_payouts) == 5, 37);
            
            // Verify total prize allocation
            let mut total = 0u64;
            let mut i = 0;
            while (i < vector::length(&stored_payouts)) {
                total = total + *vector::borrow(&stored_payouts, i);
                i = i + 1;
            };
            assert!(total == 4800000000u64, 38); // Total: 4.8 SUI
            
            // Verify pool is still not distributed
            assert!(!grant_pool::is_distributed(&pool), 39);
            
            test_scenario::return_shared(pool);
        };
        
        // 3. Verify final state
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let pool = test_scenario::take_shared<GrantPool<SUI>>(&scenario);
            
            // Final verification
            let (admin, event_id, distributed, balance, payouts) = grant_pool::get_pool_info(&pool);
            assert!(admin == ADMIN, 40);
            assert!(event_id == 1, 41);
            assert!(!distributed, 42);
            assert!(balance == 0, 43);
            assert!(vector::length(&payouts) == 5, 44);
            
            // Verify specific payout amounts
            assert!(*vector::borrow(&payouts, 0) == 2000000000u64, 45); // 1st place
            assert!(*vector::borrow(&payouts, 1) == 1200000000u64, 46); // 2nd place
            assert!(*vector::borrow(&payouts, 2) == 800000000u64, 47);  // 3rd place
            assert!(*vector::borrow(&payouts, 3) == 500000000u64, 48);  // 4th place
            assert!(*vector::borrow(&payouts, 4) == 300000000u64, 49);  // 5th place
            
            test_scenario::return_shared(pool);
        };
        
        test_scenario::end(scenario);
    }
}
