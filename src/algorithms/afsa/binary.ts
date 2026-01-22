import { ObjectiveFunction } from '../../core/optimizer';
import { StandardAFSA, AFSAConfig } from './standard';

export class SimplifiedBinaryAFSA extends StandardAFSA {
    constructor(config: AFSAConfig, func: ObjectiveFunction) {
        super(config, func);
    }
}
// Note: This is currently a stub inheriting from StandardAFSA.
// True binary implementation requires discrete/binary optimization support in the core.
// For now, we register it but it will behave like standard continuous AFSA until we add binary support.
// The book (3.2.1) describes removing Visual and Step parameters for binary optimization.
