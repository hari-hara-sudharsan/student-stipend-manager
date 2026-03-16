use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VestingStatus {
    Active,
    Paused,
    Completed,
    Revoked,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VestingSchedule {
    pub student: Address,
    pub admin: Address,
    pub total_amount: i128,           // Total stipend in stroops
    pub weekly_release: i128,         // Amount released per week
    pub start_timestamp: u64,         // Unix timestamp when vesting starts
    pub claimed_amount: i128,         // Amount already claimed
    pub created_at: u64,              // When this schedule was created
    pub status: VestingStatus,
}

impl VestingSchedule {
    /// Calculate how much is available to claim right now
    pub fn calculate_available(&self, current_timestamp: u64) -> i128 {
        // If not started yet, nothing available
        if current_timestamp < self.start_timestamp {
            return 0;
        }
        
        // If completed or revoked, nothing more available
        if self.status == VestingStatus::Completed || self.status == VestingStatus::Revoked {
            return 0;
        }
        
        // Calculate weeks elapsed since start
        let seconds_per_week: u64 = 7 * 24 * 60 * 60;
        let weeks_elapsed = (current_timestamp - self.start_timestamp) / seconds_per_week;
        
        // Total that should be released by now
        let should_be_released = self.weekly_release * weeks_elapsed as i128;
        
        // Available = should be released - already claimed (capped at total)
        let available = should_be_released - self.claimed_amount;
        
        // Ensure we don't return more than remaining total
        let remaining_total = self.total_amount - self.claimed_amount;
        available.min(remaining_total).max(0)
    }
}