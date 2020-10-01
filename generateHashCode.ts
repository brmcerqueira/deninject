export function generateHashCode(): string {
    let hash = (Math.random() * 0x40000000) | 0;
    if (hash === 0) {
        hash = 1;
    }
    return hash.toString();
}