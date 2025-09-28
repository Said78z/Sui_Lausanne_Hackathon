/// GrantPool Smart Contract
/// Manages event prize pools for hackathons, grants, and rewards
/// Provides transparency, immutability, and prevents cheating
module lemanflowcontracts::grant_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::event;
    use std::vector;

    // ==================== Error Constants ====================
    
    /// Error when caller is not the admin
    const ENotAdmin: u64 = 1;
    /// Error when pool has already been distributed
    const EAlreadyDistributed: u64 = 2;
    /// Error when insufficient funds for distribution
    const EInsufficientFunds: u64 = 3;
    /// Error when payouts vector is empty
    const EEmptyPayouts: u64 = 4;
    /// Error when winners and payouts length mismatch
    const EWinnersPayoutsMismatch: u64 = 5;
    /// Error when trying to refund a distributed pool
    const ECannotRefundDistributed: u64 = 6;
    /// Error when pool has no funds to refund
    const ENoFundsToRefund: u64 = 7;

    // ==================== Structs ====================

    /// Main GrantPool object representing one prize pool for one event
    public struct GrantPool<phantom T> has key, store {
        /// Unique identifier for the pool
        id: UID,
        /// Event organizer's address (only this account can manage the pool)
        admin: address,
        /// Identifies which hackathon/event the pool is tied to
        event_id: u64,
        /// Marks if funds have been distributed (prevents double payouts)
        distributed: bool,
        /// Holds the actual funds deposited
        pot: Balance<T>,
        /// Defines prize amounts for each position
        payouts: vector<u64>,
    }

    // ==================== Events ====================

    /// Emitted when a new pool is created
    public struct PoolCreated has copy, drop {
        pool_id: address,
        admin: address,
        event_id: u64,
        initial_amount: u64,
    }

    /// Emitted when funds are deposited to a pool
    public struct FundsDeposited has copy, drop {
        pool_id: address,
        amount: u64,
        total_balance: u64,
    }

    /// Emitted when payouts are set
    public struct PayoutsSet has copy, drop {
        pool_id: address,
        payouts: vector<u64>,
    }

    /// Emitted when prizes are distributed
    public struct PrizesDistributed has copy, drop {
        pool_id: address,
        winners: vector<address>,
        amounts: vector<u64>,
    }

    /// Emitted when funds are refunded
    public struct FundsRefunded has copy, drop {
        pool_id: address,
        admin: address,
        amount: u64,
    }

    // ==================== Entry Functions ====================

    /// Creates a new grant pool for an event
    /// Only the organizer can call this function
    #[allow(lint(public_entry))]
    public entry fun init_pool<T>(
        event_id: u64,
        funds: Coin<T>,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        let initial_amount = coin::value(&funds);
        
        let pool = GrantPool<T> {
            id: object::new(ctx),
            admin,
            event_id,
            distributed: false,
            pot: coin::into_balance(funds),
            payouts: vector::empty<u64>(),
        };

        let pool_id = object::uid_to_address(&pool.id);

        // Emit pool creation event
        event::emit(PoolCreated {
            pool_id,
            admin,
            event_id,
            initial_amount,
        });

        // Transfer pool to admin
        transfer::transfer(pool, admin);
    }

    /// Allows admin to deposit additional funds into the pool
    #[allow(lint(public_entry))]
    public entry fun deposit<T>(
        pool: &mut GrantPool<T>,
        funds: Coin<T>,
        ctx: &mut TxContext
    ) {
        // Verify caller is admin
        assert!(tx_context::sender(ctx) == pool.admin, ENotAdmin);
        
        // Verify pool hasn't been distributed yet
        assert!(!pool.distributed, EAlreadyDistributed);

        let amount = coin::value(&funds);
        balance::join(&mut pool.pot, coin::into_balance(funds));
        
        let total_balance = balance::value(&pool.pot);
        let pool_id = object::uid_to_address(&pool.id);

        // Emit deposit event
        event::emit(FundsDeposited {
            pool_id,
            amount,
            total_balance,
        });
    }

    /// Admin sets the payout amounts for each position
    #[allow(lint(public_entry))]
    public entry fun set_payouts<T>(
        pool: &mut GrantPool<T>,
        payouts: vector<u64>,
        ctx: &mut TxContext
    ) {
        // Verify caller is admin
        assert!(tx_context::sender(ctx) == pool.admin, ENotAdmin);
        
        // Verify pool hasn't been distributed yet
        assert!(!pool.distributed, EAlreadyDistributed);
        
        // Verify payouts is not empty
        assert!(!vector::is_empty(&payouts), EEmptyPayouts);

        pool.payouts = payouts;
        let pool_id = object::uid_to_address(&pool.id);

        // Emit payouts set event
        event::emit(PayoutsSet {
            pool_id,
            payouts: pool.payouts,
        });
    }

    /// Distributes prizes to winners based on predefined payouts
    #[allow(lint(public_entry))]
    public entry fun distribute<T>(
        pool: &mut GrantPool<T>,
        winners: vector<address>,
        ctx: &mut TxContext
    ) {
        // Verify caller is admin
        assert!(tx_context::sender(ctx) == pool.admin, ENotAdmin);
        
        // Verify pool hasn't been distributed yet
        assert!(!pool.distributed, EAlreadyDistributed);
        
        // Verify winners and payouts match
        assert!(vector::length(&winners) == vector::length(&pool.payouts), EWinnersPayoutsMismatch);

        // Calculate total payout needed
        let mut total_payout = 0u64;
        let mut i = 0;
        while (i < vector::length(&pool.payouts)) {
            total_payout = total_payout + *vector::borrow(&pool.payouts, i);
            i = i + 1;
        };

        // Verify sufficient funds
        assert!(balance::value(&pool.pot) >= total_payout, EInsufficientFunds);

        // Distribute prizes
        let mut distributed_amounts = vector::empty<u64>();
        i = 0;
        while (i < vector::length(&winners)) {
            let winner = *vector::borrow(&winners, i);
            let amount = *vector::borrow(&pool.payouts, i);
            
            let prize_balance = balance::split(&mut pool.pot, amount);
            let prize_coin = coin::from_balance(prize_balance, ctx);
            
            transfer::public_transfer(prize_coin, winner);
            vector::push_back(&mut distributed_amounts, amount);
            
            i = i + 1;
        };

        // Mark as distributed
        pool.distributed = true;
        let pool_id = object::uid_to_address(&pool.id);

        // Emit distribution event
        event::emit(PrizesDistributed {
            pool_id,
            winners,
            amounts: distributed_amounts,
        });
    }

    /// Refunds remaining funds to admin (only if not distributed)
    #[allow(lint(public_entry))]
    public entry fun refund<T>(
        pool: &mut GrantPool<T>,
        ctx: &mut TxContext
    ) {
        // Verify caller is admin
        assert!(tx_context::sender(ctx) == pool.admin, ENotAdmin);
        
        // Verify pool hasn't been distributed
        assert!(!pool.distributed, ECannotRefundDistributed);
        
        let refund_amount = balance::value(&pool.pot);
        
        // Verify there are funds to refund
        assert!(refund_amount > 0, ENoFundsToRefund);

        // Transfer all remaining funds back to admin
        let refund_balance = balance::withdraw_all(&mut pool.pot);
        let refund_coin = coin::from_balance(refund_balance, ctx);
        
        transfer::public_transfer(refund_coin, pool.admin);
        
        let pool_id = object::uid_to_address(&pool.id);

        // Emit refund event
        event::emit(FundsRefunded {
            pool_id,
            admin: pool.admin,
            amount: refund_amount,
        });
    }

    // ==================== View Functions ====================

    /// Get pool information
    public fun get_pool_info<T>(pool: &GrantPool<T>): (address, u64, bool, u64, vector<u64>) {
        (
            pool.admin,
            pool.event_id,
            pool.distributed,
            balance::value(&pool.pot),
            pool.payouts
        )
    }

    /// Check if pool is distributed
    public fun is_distributed<T>(pool: &GrantPool<T>): bool {
        pool.distributed
    }

    /// Get pool balance
    public fun get_balance<T>(pool: &GrantPool<T>): u64 {
        balance::value(&pool.pot)
    }

    /// Get admin address
    public fun get_admin<T>(pool: &GrantPool<T>): address {
        pool.admin
    }

    /// Get event ID
    public fun get_event_id<T>(pool: &GrantPool<T>): u64 {
        pool.event_id
    }

    /// Get payouts
    public fun get_payouts<T>(pool: &GrantPool<T>): vector<u64> {
        pool.payouts
    }

    // ==================== Test Functions ====================

    #[test_only]
    public fun init_for_testing<T>(ctx: &mut TxContext): GrantPool<T> {
        GrantPool<T> {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            event_id: 1,
            distributed: false,
            pot: balance::zero<T>(),
            payouts: vector::empty<u64>(),
        }
    }
}