export const FABRIC_ROLL_STATES = [
    { value: 0, label: 'Available' },
    { value: 1, label: 'Committed' },
];

export const getFabricRollStateValue = (state) => {
    if (typeof state === 'string') {
        const matchingState = FABRIC_ROLL_STATES.find(({ label }) => label.toLowerCase() === state.toLowerCase());
        if (matchingState) return matchingState.value;
    }

    const numericState = Number(state);
    return FABRIC_ROLL_STATES.some(({ value }) => value === numericState) ? numericState : 0;
};

export const getFabricRollStateLabel = (state) => (
    FABRIC_ROLL_STATES.find(({ value }) => value === getFabricRollStateValue(state))?.label ?? 'Available'
);