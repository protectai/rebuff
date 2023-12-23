import { TacticName } from "../interface";

export interface TacticExecution {
    // A score between 0 and 1, inclusive, representing the likelihood that the input is prompt
    // injection. The closer to 1, the more likely that is it prompt injection.
    score: number;
    // Optional additional fields that can be used to return additional information about the
    // execution of this tactic.
    additionalFields?: Record<string, any>;
}

export default interface Tactic {
    // The name of this tactic.
    name: TacticName;
    // The threshold to use to determine if the tactic has detected prompt injection. At runtime,
    // the caller can provide a different threshold to override the default.
    defaultThreshold: number;
    // Execute the tactic on the given input.
    execute(input: string, thresholdOverride?: number): Promise<TacticExecution>;
}
