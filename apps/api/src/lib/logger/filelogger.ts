import fs from 'node:fs';
import path from 'node:path';

export default class FileLogger {
    private filePath: string;
    private writeStream: fs.WriteStream;

    constructor() {
        this.filePath = path.join(process.cwd(), 'logs', this.getFileName());

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '');
        }

        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }

    closeStream() {
        this.writeStream.close();
    }

    log(message?: string, ...args: unknown[]) {
        if (!message) {
            return;
        }

        const _args: unknown[] = [];

        for (const arg of args) {
            if (typeof arg === 'object') {
                _args.push(JSON.stringify(arg, null, 4));
            } else {
                _args.push(arg);
            }
        }

        this.writeToFile(`${message} ${_args}\n`);
    }

    private getFileName() {
        return `${new Date().toISOString().split('T')[0]}.log`;
    }

    private writeToFile(message: string) {
        this.writeStream.write(message, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                this.closeStream();
            }
        });
    }
}
