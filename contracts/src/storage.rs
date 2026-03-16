use soroban_sdk::{Env, BytesN, Option};
use crate::vesting::VestingSchedule;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Vesting(BytesN<32>),  // vesting_id -> VestingSchedule
}

pub fn store_vesting(
    env: &Env,
    vesting_id: &BytesN<32>,
    vesting: &VestingSchedule,
) -> Result<(), soroban_sdk::Error> {
    env.storage()
        .persistent()
        .set(&DataKey::Vesting(vesting_id.clone()), vesting);
    Ok(())
}

pub fn get_vesting(
    env: &Env,
    vesting_id: &BytesN<32>,
) -> Option<VestingSchedule> {
    env.storage()
        .persistent()
        .get(&DataKey::Vesting(vesting_id.clone()))
}