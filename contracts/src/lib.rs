#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracterror, contracttype, Address, Env, Symbol, Vec, 
    IntoVal, String, BytesN,
};
use crate::vesting::{VestingSchedule, VestingStatus};
use crate::storage::{DataKey, VestingData};
use crate::events::{VestingCreated, VestingClaimed};

mod vesting;
mod storage;
mod events;
mod test;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VestingError {
    VestingNotFound,
    AlreadyClaimed,
    NotVestedYet,
    Unauthorized,
    InvalidAmount,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    VestingError = 1,
}

#[contract]
pub struct StudentVestingContract;

#[contractimpl]
impl StudentVestingContract {
    /// Create a new vesting schedule for a student
    /// 
    /// # Arguments
    /// * `student` - The student's Stellar address who will receive funds
    /// * `admin` - The NGO/admin address authorizing this vesting
    /// * `total_amount` - Total stipend amount in stroops (1 USDC = 10^7 stroops)
    /// * `weekly_release` - Amount released each week in stroops
    /// * `start_timestamp` - Unix timestamp when vesting begins
    /// * `vesting_id` - Unique identifier for this vesting schedule
    pub fn create_vesting(
        env: Env,
        student: Address,
        admin: Address,
        total_amount: i128,
        weekly_release: i128,
        start_timestamp: u64,
        vesting_id: BytesN<32>,
    ) -> Result<(), Error> {
        admin.require_auth();
        
        // Validate inputs
        if total_amount <= 0 || weekly_release <= 0 {
            return Err(Error::VestingError(VestingError::InvalidAmount));
        }
        if total_amount < weekly_release {
            return Err(Error::VestingError(VestingError::InvalidAmount));
        }
        
        // Store vesting schedule
        let vesting = VestingSchedule {
            student: student.clone(),
            admin: admin.clone(),
            total_amount,
            weekly_release,
            start_timestamp,
            claimed_amount: 0,
            created_at: env.ledger().timestamp(),
            status: VestingStatus::Active,
        };
        
        storage::store_vesting(&env, &vesting_id, &vesting)?;
        
        // Emit event for off-chain indexing
        env.events().publish(
            (Symbol::new(&env, "vesting_created"), vesting_id.clone()),
            VestingCreated {
                student,
                admin,
                total_amount,
                weekly_release,
                start_timestamp,
            },
        );
        
        Ok(())
    }
    
    /// Claim available vested funds
    /// 
    /// # Arguments
    /// * `student` - The student claiming funds (must match vesting schedule)
    /// * `vesting_id` - The unique vesting identifier
    pub fn claim_vested(
        env: Env,
        student: Address,
        vesting_id: BytesN<32>,
    ) -> Result<i128, Error> {
        student.require_auth();
        
        let mut vesting = storage::get_vesting(&env, &vesting_id)
            .ok_or(Error::VestingError(VestingError::VestingNotFound))?;
        
        // Verify student address matches
        if vesting.student != student {
            return Err(Error::VestingError(VestingError::Unauthorized));
        }
        
        // Calculate available amount
        let available = vesting.calculate_available(env.ledger().timestamp());
        
        if available == 0 {
            return Err(Error::VestingError(VestingError::NotVestedYet));
        }
        
        // Update claimed amount
        vesting.claimed_amount += available;
        
        // Check if fully claimed
        if vesting.claimed_amount >= vesting.total_amount {
            vesting.status = VestingStatus::Completed;
        }
        
        // Save updated vesting
        storage::store_vesting(&env, &vesting_id, &vesting)?;
        
        // Emit claim event
        env.events().publish(
            (Symbol::new(&env, "vesting_claimed"), vesting_id.clone()),
            VestingClaimed {
                student: student.clone(),
                amount: available,
                remaining: vesting.total_amount - vesting.claimed_amount,
            },
        );
        
        // In production: Transfer tokens from contract balance to student
        // For hackathon demo: Return amount for frontend simulation
        Ok(available)
    }
    
    /// Get vesting schedule details (public read)
    pub fn get_vesting(
        env: Env,
        vesting_id: BytesN<32>,
    ) -> Option<VestingSchedule> {
        storage::get_vesting(&env, &vesting_id)
    }
    
    /// Calculate available amount without claiming (for UI display)
    pub fn get_available_amount(
        env: Env,
        vesting_id: BytesN<32>,
    ) -> Result<i128, Error> {
        let vesting = storage::get_vesting(&env, &vesting_id)
            .ok_or(Error::VestingError(VestingError::VestingNotFound))?;
        
        Ok(vesting.calculate_available(env.ledger().timestamp()))
    }
}