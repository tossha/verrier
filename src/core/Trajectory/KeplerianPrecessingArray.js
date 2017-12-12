import TrajectoryKeplerianArray from "./KeplerianArray";

export default class TrajectoryKeplerianPrecessingArray extends TrajectoryKeplerianArray
{
    constructor(referenceFrameId, r, j2) {
        super(referenceFrameId);
        this.r = r;
        this.j2 = j2;
    }

    approximateKeplerianObject(object1, object2, epoch) {
        return super.approximateKeplerianObject(
            object1.copy().addPrecession(this.r, this.j2, epoch),
            object2.copy().addPrecession(this.r, this.j2, epoch),
            epoch
        );
    }
}