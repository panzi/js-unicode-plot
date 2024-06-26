import unicodePlot from "./index.js";

function makeBox(text: string|string[]): string[] {
    const lines = Array.isArray(text) ? text : text.split('\n');
    let maxLen = 0;
    for (const line of lines) {
        const len = (line ?? '').length;
        if (len > maxLen) {
            maxLen = len;
        }
    }

    const outline = '─'.repeat(maxLen);
    const out: string[] = [];
    out.push(`┌${outline}┐`);
    for (const line of lines) {
        out.push(`│${(line ?? '').padEnd(maxLen)}│`);
    }
    out.push(`└${outline}┘`);

    return out;
}

function main() {
    const TAU = 2 * Math.PI;
    const message = 'Press Control+C to exit.';

    process.stdout.write('\x1B[?25l');

    const functs: [(x: number) => number, [min: number, max: number]][] = [
        [Math.sin, [-1.5, 1.5]],
        [x => Math.sin(x * 2), [-1.5, 1.5]],
        [x => Math.max(Math.sin(x), 0), [0, 1]],
        [x => Math.pow(Math.sin(x), 2), [0, 1]],
        [x => Math.sin(x) - 2, [-3, 0]],
        [x => Math.sin(x) + 2, [0, 3]],
        [x => Math.sin(x * 17) * 0.5 + Math.cos(x * 13) * 0.1 + Math.sin(x * Math.PI * 2) * 0.3 + Math.sin(x * x * 5) * 0.2, [-1, 1]],
    ];

    let timer: NodeJS.Timeout|null = setInterval(() => {
        const now = Date.now();
        const values: [number, number][] = new Array((process.stdout.columns ?? 80) * 3);
        const [f, yRange] = functs[((now / 5_000)|0) % functs.length];
        for (let index = 0; index < values.length; ++ index) {
            const x = ((now / 5_000 * TAU) + (TAU * (index / values.length)));
            values[index] = [x, f(x % TAU)];
        }
        const lines = unicodePlot(values, {
            yRange,
            xLabel: x => x.toFixed(3),
            yLabel: y => y.toFixed(3).padStart(6),
            width:  (process.stdout.columns ?? 80) - 9,
            height: (process.stdout.rows    ?? 40) - 5,
            aggregate: 'average',
            style: now % 5_000 >= 2_500 ? 'line' : 'filled',
        });
        const box = makeBox(lines);
        process.stdout.write('\x1B[1;1H\x1B[2J');
        console.log(box.join('\n'))
        console.log(message.padStart(message.length + ((box[0].length - message.length) >> 1)));
    }, 1000/30);

    const shutdown = () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', () => {
        process.stdout.write('\x1B[?25h');
    });
}

main();
