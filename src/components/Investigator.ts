export class Investigator {
    public constructor(
        public health: number,
        public sanity: number,
        public lore: number,
        public influence: number,
        public observation: number,
        public strength: number,
        public will: number,
        public trainTickets: number = 0,
        public shipTickets: number = 0
    ) { }
}
