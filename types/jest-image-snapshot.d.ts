declare module "jest-image-snapshot" {
    export interface MatchImageSnapshotConfig {
        customSnapshotIdentifier: string
        customSnapshotsDir: string
    }

    export function toMatchImageSnapshot(this: jest.MatcherUtils, received: Buffer, config: MatchImageSnapshotConfig): {
        pass: boolean
        message(): string
    }
}

declare namespace jest {
    interface Matchers {
        toMatchImageSnapshot: () => void;
    }
}
