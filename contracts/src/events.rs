use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VestingCreated {
    pub student: Address,
    pub admin: Address,
    pub total_amount: i128,
    pub weekly_release: i128,
    pub start_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VestingClaimed {
    pub student: Address,
    pub amount: i128,
    pub remaining: i128,
}