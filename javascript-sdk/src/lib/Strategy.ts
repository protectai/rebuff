import Tactic from "../tactics/Tactic";

export default interface Strategy {
  // The tactics that will be executed as part of this strategy.
  tactics: Tactic[];
}
